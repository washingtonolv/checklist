import { beforeEach, expect, it, vi } from "vitest";
import sharp from "sharp";
const state=vi.hoisted(()=>({actor:{id:"owner",role:"manager"},users:[{id:"owner",avatar:null as string|null}]}));
vi.mock("@/lib/auth-server",()=>({requireUser:async()=>state.actor}));
vi.mock("@/lib/backend",()=>({isLocalMode:()=>true}));
vi.mock("@/lib/backend/local/db",()=>({getDb:async()=>({users:state.users}),mutateDb:async(fn:any)=>fn({users:state.users})}));
vi.mock("@/lib/supabase/server",()=>({createSupabaseServerClient:async()=>({auth:{
   getUser:async()=>({data:{user:{user_metadata:{profile_photo:state.users[0].avatar}}},error:null}),
   updateUser:async({data}:any)=>{state.users[0].avatar=data.profile_photo;return {error:null};}
 }})}));
vi.mock("@/lib/supabase/admin",()=>({createSupabaseAdminClient:vi.fn()}));
import { GET, POST } from "../src/app/api/avatar/[id]/route";
beforeEach(()=>{state.actor={id:"owner",role:"manager"};state.users[0].avatar=null;});
it("uploads a decoded thumbnail, serves it, and removes it",async()=>{
 const png=await sharp({create:{width:12,height:12,channels:3,background:"red"}}).png().toBuffer();
 const form=new FormData();form.set("photo",new File([png],"photo.png",{type:"image/png"}));
 expect((await POST(new Request("http://localhost/api/avatar/owner",{method:"POST",body:form}),{params:Promise.resolve({id:"owner"})})).status).toBe(200);
 const photo=await GET(new Request("http://localhost"),{params:Promise.resolve({id:"owner"})});
 expect(photo.headers.get("Content-Type")).toBe("image/webp");
 expect((await sharp(Buffer.from(await photo.arrayBuffer())).metadata()).width).toBe(96);
 const remove=new FormData();remove.set("remove","true");
 expect((await POST(new Request("http://localhost",{method:"POST",body:remove}),{params:Promise.resolve({id:"owner"})})).status).toBe(200);
 expect(state.users[0].avatar).toBeNull();
});
it("blocks changes to another user's photo and non-admin reads",async()=>{
 const form=new FormData();form.set("remove","true");
 expect((await POST(new Request("http://localhost",{method:"POST",body:form}),{params:Promise.resolve({id:"other"})})).status).toBe(403);
 expect((await GET(new Request("http://localhost"),{params:Promise.resolve({id:"other"})})).status).toBe(403);
});
it("rejects disguised images without saving them",async()=>{
 const form=new FormData();form.set("photo",new File(["not an image"],"fake.png",{type:"image/png"}));
 expect((await POST(new Request("http://localhost",{method:"POST",body:form}),{params:Promise.resolve({id:"owner"})})).status).toBe(400);
 expect(state.users[0].avatar).toBeNull();
});
