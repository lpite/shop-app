import{b as D,r as s,j as e}from"./vendor-fhPXKY0o.js";import{I,w as O,u as C,a as P,s as T,m as S,g as N,U as j,b as M}from"./index-WC3bYQnH.js";const v=I?r=>{r()}:D.startTransition,k=r=>{const[,g]=s.useState({}),a=s.useRef(!1),f=s.useRef(r),n=s.useRef({data:!1,error:!1,isValidating:!1}),h=s.useCallback(t=>{let d=!1;const c=f.current;for(const o in t)if(Object.prototype.hasOwnProperty.call(t,o)){const i=o;c[i]!==t[i]&&(c[i]=t[i],n.current[i]&&(d=!0))}d&&!a.current&&g({})},[]);return M(()=>(a.current=!1,()=>{a.current=!0})),[f,n.current,h]},V=()=>(r,g,a={})=>{const{mutate:f}=P(),n=s.useRef(r),h=s.useRef(g),t=s.useRef(a),d=s.useRef(0),[c,o,i]=k({data:j,error:j,isMutating:!1}),m=c.current,w=s.useCallback(async(u,b)=>{const[x,$]=T(n.current);if(!h.current)throw new Error("Can’t trigger the mutation: missing fetcher.");if(!x)throw new Error("Can’t trigger the mutation: missing key.");const l=S(S({populateCache:!1,throwOnError:!0},t.current),b),R=N();d.current=R,i({isMutating:!0});try{const p=await f(x,h.current($,{arg:u}),S(l,{throwOnError:!0}));return d.current<=R&&(v(()=>i({data:p,isMutating:!1,error:void 0})),l.onSuccess==null||l.onSuccess.call(l,p,x,l)),p}catch(p){if(d.current<=R&&(v(()=>i({error:p,isMutating:!1})),l.onError==null||l.onError.call(l,p,x,l),l.throwOnError))throw p}},[]),y=s.useCallback(()=>{d.current=N(),i({data:j,error:j,isMutating:!1})},[]);return M(()=>{n.current=r,h.current=g,t.current=a}),{trigger:w,reset:y,get data(){return o.data=!0,m.data},get error(){return o.error=!0,m.error},get isMutating(){return o.isMutating=!0,m.isMutating}}},A=O(C,V);async function E({url:r,method:g,query:a,body:f}){const n=localStorage.getItem("ip");return fetch(`http://${n}/1c_connector/index.php`,{method:"POST",body:JSON.stringify({url:r,method:g,query:a,body:f})}).then(h=>h.json())}function U(){const[r,g]=s.useState(void 0),[a,f]=s.useState(0),[n,h]=s.useState(""),{data:t,mutate:d,isLoading:c,isValidating:o}=C("/prices/",()=>E({url:`/shop/hs/api/product-price/00-${"0".repeat(8-n.length)+n}/Розничная`,method:"GET"}),{revalidateOnFocus:!1}),{trigger:i,isMutating:m}=A("/mutate",()=>E({url:`/shop/hs/api/product-price/00-${"0".repeat(8-n.length)+n}/Розничная`,method:"PATCH",body:{newPrice:a,registatorDate:t&&t[r].registatorDate,registatorType:t&&t[r].registatorType,registatorId:t&&t[r].registatorId}}));async function w(){if(!t){alert("Немає цін");return}if(!r){alert("Не обрана ціна");return}if(a===0){alert("Не вказана нова ціна");return}confirm(`Змінити ${t&&t[r].price} -> ${a} ??`)&&(await i(),await d(),f(0))}function y(u){if(u.preventDefault(),!n){alert("Пусто в пошуку");return}d()}return e.jsxs("main",{className:"flex items-center justify-center flex-col h-full",children:[e.jsx("h1",{className:"text-3xl mb-2 font-medium",children:"Змінювалка цін"}),e.jsxs("form",{onSubmit:y,children:[e.jsx("input",{className:"border-2 m-2 mt-4 outline-none p-1.5 py-2 rounded-lg duration-150 focus:shadow-md",onChange:u=>h(u.target.value)}),e.jsx("button",{disabled:c||o,className:"border-2 m-2 mt-4 outline-none px-4 py-2 rounded-lg hover:shadow-md focus:shadow-md disabled:bg-gray-500 duration-150",children:"пошук"})]}),e.jsxs("div",{className:"h-2/6 relative",children:[e.jsx("div",{className:`border-4 border-t-transparent h-12 w-12 rounded-full absolute left-2/4 top-2/4 animate-spin ${c||o?"opacity-100":"opacity-0"}`}),e.jsxs("table",{cellSpacing:0,cellPadding:4,children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"№ док"}),e.jsx("th",{children:"Дата"}),e.jsx("th",{children:"Ціна"})]})}),e.jsx("tbody",{className:`${c||o?"opacity-0":"opacity-100"} transition-opacity duration-150`,children:t==null?void 0:t.map((u,b)=>e.jsxs("tr",{className:`${r===b?"bg-slate-400":""} cursor-pointer h-2`,onMouseDown:()=>g(b),children:[e.jsx("td",{className:`${c||o?"border-transparent":""} border-2`,children:u.registatorId}),e.jsx("td",{className:`${c||o?"border-transparent":""} border-2`,children:u.registatorDate}),e.jsx("td",{className:`${c||o?"border-transparent":""} border-2`,children:u.price})]},b))})]})]}),e.jsxs("div",{children:["Нова ціна",e.jsx("input",{className:"border-2 m-2 mt-4 outline-none p-1.5 py-2 rounded-lg duration-150 focus:shadow-md w-24",type:"number",value:a.toString(),onChange:u=>f(parseInt(u.target.value))})]}),e.jsx("button",{className:"bg-red-200 px-4 py-2 rounded-lg disabled:bg-gray-400 duration-150 hover:shadow-md",onClick:w,disabled:m,children:"Зберегти"})]})}export{U as default};