import { beforeEach, expect, it, vi } from "vitest";
const s=vi.hoisted(()=>({ remove:vi.fn(), rpc:vi.fn(), rows:[{id:"id",storage_path:"key"}], error:null as any, cutoff:vi.fn() }));
vi.mock("../src/lib/photo-store",()=>({assertPhotoEnvironment:vi.fn(),RETENTION_MS:90*86400000,createPhotoObjectStore:()=>({delete:s.remove})}));
vi.mock("../src/lib/supabase/admin",()=>({createSupabaseAdminClient:()=>({rpc:s.rpc,from:()=>{
  const q:any={select:()=>q,is:()=>q,lte:(_key:string,value:string)=>{s.cutoff(value);return q;},order:()=>q,limit:async()=>({data:s.rows,error:s.error})};return q;
}})}));
import { expirePhotos } from "../src/lib/photo-retention";
import { POST } from "../src/app/api/cron/photos/route";
beforeEach(()=>{vi.clearAllMocks();s.error=null;s.remove.mockResolvedValue(undefined);s.rpc.mockResolvedValue({error:null});vi.unstubAllEnvs();});
it("deletes expired objects then atomically marks metadata and audit",async()=>{
  const now=Date.parse("2026-11-12T00:00:00Z"); expect(await expirePhotos(now)).toBe(1);
  expect(s.cutoff).toHaveBeenCalledWith(new Date(now-90*86400000).toISOString());
  expect(s.remove).toHaveBeenCalledWith("key"); expect(s.rpc).toHaveBeenCalledWith("expire_r2_photo",{p_id:"id"});
  expect(s.remove.mock.invocationCallOrder[0]).toBeLessThan(s.rpc.mock.invocationCallOrder[0]);
});
it("leaves retryable metadata when R2 fails and propagates database failures",async()=>{
  s.remove.mockRejectedValue(new Error("R2")); await expect(expirePhotos()).rejects.toThrow("R2"); expect(s.rpc).not.toHaveBeenCalled();
  s.remove.mockResolvedValue(undefined);s.rpc.mockResolvedValue({error:new Error("DB")});await expect(expirePhotos()).rejects.toThrow("DB");
});
it("requires a configured bearer secret, including in development",async()=>{
  expect((await POST(new Request("http://localhost",{method:"POST"}))).status).toBe(401);
  vi.stubEnv("PHOTO_RETENTION_CRON_SECRET","test-secret");
  expect((await POST(new Request("http://localhost",{method:"POST",headers:{authorization:"Bearer wrong"}}))).status).toBe(401);
  expect((await POST(new Request("http://localhost",{method:"POST",headers:{authorization:"Bearer test-secret"}}))).status).toBe(200);
});
