import{b as h,u as m,j as e,R as f,a as x,r as j,L as b}from"./vendor-fhPXKY0o.js";import{u as p}from"./useAppStore-DTO0pbEg.js";import{R as g,T as y,P as N,O as v,C,a as S}from"./index-Cbk17sIO.js";function u({url:s,method:r,query:c,body:o}){const[t,l]=h.useState(),[d,a]=h.useState(!1),[n]=h.useState(localStorage.getItem("ip")||"localhost");return h.useEffect(()=>(a(!0),fetch(`http://${n}/1c_connector/index.php`,{method:"POST",body:JSON.stringify({url:s,method:r,query:c,body:o})}).then(i=>i.json()).then(i=>{l(i)}).finally(()=>{a(!1)}),()=>{a(!1)}),[]),{data:t,isLoading:d}}function w(s){return"0".repeat(8-s.length)+s}function R({url:s,method:r,query:c,body:o}){const t=localStorage.getItem("ip");return fetch(`http://${t}/1c_connector/index.php`,{method:"POST",body:JSON.stringify({url:s,method:r,query:c,body:o})}).then(l=>l.json())}function T({items:s}){const{forReplace:{replaceW:r,searchV:c,field:o},setReplace:t}=p();return e.jsx("form",{children:e.jsxs("div",{className:"flex gap-2",children:[e.jsx("label",{children:e.jsx("select",{defaultValue:o,onChange:({target:l})=>t({field:l.value}),children:Object.keys(s&&s[0]||{}).map(l=>e.jsx("option",{value:l,children:l}))})}),e.jsxs("label",{children:[":",e.jsx("input",{type:"text",className:"border-2",value:c,onChange:({target:l})=>t({searchV:l.value})})]}),e.jsxs("label",{children:["with:",e.jsx("input",{type:"text",className:"border-2",value:r,onChange:({target:l})=>t({replaceW:l.value})})]})]})})}function E({items:s}){return e.jsx("form",{children:e.jsx("div",{className:"flex gap-2",children:e.jsx("label",{children:e.jsx("select",{children:Object.keys(s&&s[0]||{}).map(r=>e.jsx("option",{children:r}))})})})})}function I(){return m(),e.jsxs(f,{children:[e.jsx(x,{path:"1",element:e.jsx(k,{})}),e.jsx(x,{path:"edit",element:e.jsx(O,{})})]})}function k(){var d;const{data:s}=u({url:"/shop/hs/app/product/",method:"GET"}),[r,c]=j.useState(""),{selected:o,toggleSelected:t,deselectAll:l}=p();return e.jsxs("main",{className:"flex items-center justify-center flex-col",children:[e.jsx(P,{}),e.jsx("h1",{className:"text-4xl",children:"Вибір товарів"}),e.jsxs("form",{className:"w-4/12 flex gap-2 pb-4",children:[e.jsx("input",{type:"text",onChange:({target:a})=>c(a.value),className:"border-2 rounded-xl shadow-sm p-2  w-full"}),e.jsx("button",{className:"border-2 rounded-xl px-6 py-2 shadow-sm",type:"button",children:"all"}),e.jsx("button",{className:"border-2 rounded-xl px-6 py-2 shadow-sm",type:"button",onClick:l,children:"deselect"})]}),(d=s==null?void 0:s.filter(a=>a.name.includes(r)))==null?void 0:d.slice(0,500).map(a=>e.jsx("div",{className:"w-8/12",children:e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",checked:o.includes(a.searchCode),onChange:()=>t(a.searchCode)}),e.jsx("span",{className:"px-1",children:a.name})]})},a.searchCode))]})}function O(){var a;const{data:s}=u({url:"/shop/hs/app/product/",method:"GET"}),{selected:r,selectedAction:c,selectActionD:o,forReplace:t}=p();async function l(n){R({url:`/shop/hs/api/product/00-${w(n.searchCode)}`,method:"PATCH",body:{...n}})}function d(){confirm("?")&&(s==null||s.filter(n=>r.includes(n.searchCode)).forEach(n=>{if(c==="replace"){const i={...n};i[t.field]=i[t.field].replace(t.searchV,t.replaceW),i.placeStorage=i.place3,l(i)}}))}return e.jsxs("main",{className:"flex flex-col items-center",children:[e.jsx("h1",{children:"EDIT"}),e.jsx("button",{className:"px-4 py-2 border-2",onClick:d,children:"save"}),e.jsxs("label",{children:["action:",e.jsxs("select",{defaultValue:c,onChange:({target:n})=>o(n.value),children:[e.jsx("option",{value:"replace",children:"replace"}),e.jsx("option",{value:"set",children:"set"})]})]}),c==="replace"?e.jsx(T,{items:s}):null,c==="set"?e.jsx(E,{items:s}):null,(a=s==null?void 0:s.filter(n=>r.includes(n.searchCode)))==null?void 0:a.slice(0,500).map(n=>e.jsx("div",{className:"w-8/12",children:e.jsx("span",{className:"px-1",children:c==="replace"?n.name.replace(t.searchV,t.replaceW):null})},n.searchCode))]})}function P(){return e.jsxs(g,{children:[e.jsx(y,{asChild:!0,children:e.jsx("button",{className:"fixed top-5 end-5 bg-green-300 py-2 px-4 rounded-lg",children:"Next"})}),e.jsxs(N,{children:[e.jsx(v,{className:"fixed inset-0 bg-black bg-opacity-25"}),e.jsxs(C,{className:"fixed min-w-80 min-h-80 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 py-5 px-8",children:[e.jsx(S,{className:"text-3xl pb-4",children:"Next step?"}),e.jsx(b,{to:"/test2/edit",className:"h-full border-2 flex items-center justify-center rounded-xl py-2 px-4 shadow-sm hover:shadow-md",children:"Edit"})]})]})]})}export{I as default};