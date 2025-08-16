import{j as e}from"./bootstrap-Bhj38lrG.js";import{r as y}from"./vendor-vT5NdfSc.js";import{u as W,r as E,c as S,f as j}from"./index-BaVDjBPn.js";import"./icons-okTEACyS.js";const V=`
  .price-highlight {
    font-weight: bold;
    color: #2c3e50;
    font-size: 16px;
    background-color: #f9f9f9;
    padding: 5px 10px;
    border-radius: 4px;
    margin: 5px 0;
    border-left: 3px solid #e74c3c;
  }
  
  .payment-status {
    background-color: #fff8e1;
    padding: 5px 8px;
    border-radius: 4px;
    font-weight: 500;
    color: #d35400;
    border: 1px dashed #f39c12;
    display: inline-block;
    margin-top: 5px;
  }
  
  .deposit-info {
    margin-top: 5px;
    font-size: 13px;
    background-color: #f8f9fa;
    border-radius: 4px;
    padding: 5px 8px;
  }
  
  .deposit-paid {
    color: #27ae60;
    margin: 0;
    font-weight: 500;
  }
  
  .balance-due {
    color: #e74c3c;
    margin: 0;
    font-weight: 500;
  }
  
  .message-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
  
  .view-message {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
  }
  
  .view-message:hover {
    background-color: #2980b9;
  }
  
  /* Estilos para la modal de mensaje */
  .reservation-message-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .reservation-message-content {
    background-color: white;
    border-radius: 12px;
    padding: 25px;
    width: 90%;
    max-width: 650px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 6px 25px rgba(0,0,0,0.3);
  }
  
  .reservation-message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #ecf0f1;
    margin-bottom: 20px;
    padding-bottom: 15px;
  }
  
  .reservation-message-title {
    font-size: 22px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }
  
  .reservation-message-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #7f8c8d;
    padding: 5px 10px;
    border-radius: 5px;
  }
  
  .reservation-message-close:hover {
    background-color: #f1f1f1;
  }
  
  .reservation-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .reservation-info-field {
    margin-bottom: 12px;
  }
  
  .reservation-info-label {
    display: block;
    font-weight: bold;
    color: #555;
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  .reservation-info-value {
    display: block;
    font-size: 16px;
    color: #333;
    background-color: #f8f9fa;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #e9ecef;
  }
  
  .reservation-message-body {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    line-height: 1.6;
    margin-top: 10px;
  }
`,J=()=>{y.useEffect(()=>{const t=document.createElement("style");return t.innerHTML=V,document.head.appendChild(t),()=>{document.head.removeChild(t)}},[]);const[x,N]=y.useState([]),[A,I]=y.useState(!0),[R,T]=y.useState(null),[w,D]=y.useState("all"),[u,v]=y.useState(null),{getAllProperties:z}=W(),P=z();y.useEffect(()=>{(async()=>{I(!0);try{const n=await E.getAll();n&&n.data&&(console.log("Reservas cargadas:",n.data),N(n.data))}catch(n){console.error("Error cargando reservas:",n),T("Error al cargar las reservas")}finally{I(!1)}})()},[]);const g={all:x,pending:x.filter(t=>t.status==="pending"),confirmed:x.filter(t=>t.status==="confirmed"),cancelled:x.filter(t=>t.status==="cancelled"),completed:x.filter(t=>t.status==="completed")},b=async(t,n)=>{try{await E.updateStatus(t,n),N(o=>o.map(r=>r.id===t?{...r,status:n}:r)),u&&u.id===t&&v(o=>({...o,status:n})),alert(`Reserva ${t} actualizada a estado: ${n}`)}catch(o){console.error("Error actualizando estado de reserva:",o),alert("Error al actualizar el estado de la reserva")}},$=async t=>{var n,o;try{const r=x.find(a=>a.id===t),i=S(r),c=(i==null?void 0:i.totalAmount)||((n=r.priceInfo)==null?void 0:n.totalAmount)||0,l={provider:"efectivo",paymentMethod:"cash",amount:Math.round(c*.3),isDeposit:!0,depositPercentage:30,totalAmount:c,currency:(i==null?void 0:i.currency)||((o=r.priceInfo)==null?void 0:o.currency)||"ARS",paymentStatus:"approved"};await E.updatePayment(t,l),N(a=>a.map(d=>d.id===t?{...d,paymentInfo:l}:d)),u&&u.id===t&&v(a=>({...a,paymentInfo:l})),alert(`Seña del 30% en efectivo registrada para la reserva ${t}. Resto del pago al momento del check-in.`)}catch(r){console.error("Error actualizando información de pago:",r),alert("Error al actualizar la información de pago")}},M=(t,n=null)=>{const o=document.createElement("div");o.style.position="fixed",o.style.top="0",o.style.left="0",o.style.width="100%",o.style.height="100%",o.style.backgroundColor="rgba(0,0,0,0.5)",o.style.display="flex",o.style.justifyContent="center",o.style.alignItems="center",o.style.zIndex="9999";const r=document.createElement("div");r.style.backgroundColor="white",r.style.padding="30px",r.style.borderRadius="12px",r.style.maxWidth="650px",r.style.width="85%",r.style.maxHeight="85vh",r.style.overflowY="auto",r.style.boxShadow="0 6px 25px rgba(0,0,0,0.3)";const i=document.createElement("div");i.style.display="flex",i.style.justifyContent="space-between",i.style.alignItems="center",i.style.marginBottom="25px",i.style.borderBottom="2px solid #eee",i.style.paddingBottom="15px";const c=document.createElement("h3");c.textContent="Mensaje de Reserva",c.style.margin="0",c.style.fontSize="22px",c.style.fontWeight="600",c.style.color="#2c3e50";const s=document.createElement("button");s.textContent="✕",s.style.background="none",s.style.border="none",s.style.fontSize="22px",s.style.cursor="pointer",s.style.color="#666",s.style.padding="5px 10px",s.style.borderRadius="5px",s.style.transition="background-color 0.2s",s.onmouseover=()=>s.style.backgroundColor="#f1f1f1",s.onmouseout=()=>s.style.backgroundColor="transparent",s.onclick=()=>document.body.removeChild(o);const l=document.createElement("div");l.style.marginBottom="25px",l.style.display="grid",l.style.gridTemplateColumns="repeat(2, 1fr)",l.style.gap="15px";const a=document.createElement("div");if(a.style.lineHeight="1.6",a.style.color="#333",a.style.backgroundColor="#f9f9f9",a.style.padding="15px",a.style.borderRadius="8px",a.style.marginTop="15px",i.appendChild(c),i.appendChild(s),r.appendChild(i),n){const p=(O,L)=>{const k=document.createElement("div");k.style.marginBottom="12px";const f=document.createElement("span");f.textContent=O+":",f.style.display="block",f.style.fontWeight="bold",f.style.color="#555",f.style.fontSize="14px",f.style.marginBottom="5px";const m=document.createElement("span");return m.textContent=L||"No especificado",m.style.display="block",m.style.fontSize="16px",m.style.color="#333",m.style.backgroundColor="#f8f9fa",m.style.padding="8px 12px",m.style.borderRadius="4px",m.style.border="1px solid #e9ecef",k.appendChild(f),k.appendChild(m),k},h=document.createElement("div");h.appendChild(p("Propiedad",n.propertyName)),h.appendChild(p("Cliente",n.fullName)),h.appendChild(p("Email",n.email));const C=document.createElement("div");C.appendChild(p("Teléfono",n.phone)),C.appendChild(p("Fecha",new Date(n.createdAt).toLocaleString("es-ES"))),l.appendChild(h),l.appendChild(C),r.appendChild(l)}const d=document.createElement("h4");d.textContent="Mensaje:",d.style.margin="15px 0 10px",d.style.fontSize="16px",d.style.color="#444",r.appendChild(d),a.textContent=t,r.appendChild(a),o.appendChild(r),o.addEventListener("click",p=>{p.target===o&&document.body.removeChild(o)}),document.body.appendChild(o)},F=()=>{var s,l;if(!u)return null;const t=u,n=P[t.propertyId]||{title:t.propertyName||"Propiedad no encontrada"},o=a=>{const d=new Date(a),p=String(d.getUTCDate()).padStart(2,"0"),h=String(d.getUTCMonth()+1).padStart(2,"0"),C=d.getUTCFullYear();return`${p}/${h}/${C}`},r=o(t.checkIn),i=o(t.checkOut),c=Math.ceil((new Date(t.checkOut)-new Date(t.checkIn))/(1e3*60*60*24));return e.jsxs("div",{className:"reservation-details",children:[e.jsx("h3",{children:"Detalles de la Reserva"}),e.jsxs("div",{className:"details-grid",children:[e.jsxs("div",{className:"detail-group",children:[e.jsx("h4",{children:"Información de Propiedad"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Propiedad:"})," ",n.title]}),e.jsxs("p",{children:[e.jsx("strong",{children:"ID Propiedad:"})," ",t.propertyId]})]}),e.jsxs("div",{className:"detail-group",children:[e.jsx("h4",{children:"Fechas y Huéspedes"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Check-in:"})," ",r]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Check-out:"})," ",i]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Noches:"})," ",c]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Huéspedes:"})," ",t.guests]})]}),e.jsxs("div",{className:"detail-group",children:[e.jsx("h4",{children:"Información del Cliente"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Nombre:"})," ",t.fullName]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Email:"})," ",t.email]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Teléfono:"})," ",t.phone||"No especificado"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"ID:"})," ",t.idType==="dni"?"DNI":"Pasaporte"," ",t.dni]})]}),e.jsxs("div",{className:"detail-group",children:[e.jsx("h4",{children:"Estado y Pago"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Estado:"}),e.jsxs("span",{className:`status status-${t.status}`,children:[t.status==="pending"&&"Pendiente",t.status==="confirmed"&&"Confirmada",t.status==="cancelled"&&"Cancelada",t.status==="completed"&&"Completada"]})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Pago:"}),(s=t.paymentInfo)!=null&&s.provider?e.jsx("span",{children:t.paymentInfo.provider==="efectivo"?"Efectivo":t.paymentInfo.provider}):e.jsx("span",{className:"no-payment",children:"No especificado"})]}),(()=>{const a=S(t);return a?e.jsxs("div",{className:"price-section",children:[e.jsx("p",{className:"price-title",children:e.jsx("strong",{children:"Precio calculado:"})}),e.jsx("p",{className:"price-value",children:j(a.totalAmount,a.currency)}),e.jsxs("p",{className:"price-detail",children:[a.nights," noches x ",j(a.pricePerNight,a.currency),"/noche",e.jsxs("span",{className:"price-period",children:["Tarifa ",a.period==="daily"?"diaria":a.period==="weekly"?"semanal":"mensual"]})]}),e.jsxs("p",{className:"deposit-value",children:[e.jsx("strong",{children:"Seña (30%):"})," ",j(Math.round(a.totalAmount*.3),a.currency)]})]}):t.priceInfo?e.jsxs("p",{children:[e.jsx("strong",{children:"Monto:"})," ",t.priceInfo.currency," $",t.priceInfo.totalAmount]}):null})()]})]}),e.jsxs("div",{className:"message-box",children:[e.jsx("h4",{children:"Mensaje del Cliente"}),e.jsx("p",{children:t.message})]}),e.jsxs("div",{className:"action-buttons",children:[t.status==="pending"&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"action-btn confirm-btn",onClick:()=>b(t.id,"confirmed"),children:"✅ Confirmar Reserva"}),e.jsx("button",{className:"action-btn reject-btn",onClick:()=>b(t.id,"cancelled"),children:"❌ Rechazar Reserva"})]}),["pending","confirmed"].includes(t.status)&&!((l=t.paymentInfo)!=null&&l.provider)&&e.jsx("button",{className:"action-btn cash-btn",onClick:()=>$(t.id),children:"💵 Registrar Seña 30% en Efectivo"}),t.status==="confirmed"&&e.jsx("button",{className:"action-btn complete-btn",onClick:()=>b(t.id,"completed"),children:"🏁 Marcar como Completada"}),e.jsx("button",{className:"action-btn close-btn",onClick:()=>v(null),children:"⬅️ Volver a la Lista"})]})]})},U=()=>{const t=g[w]||[];return t.length===0?e.jsxs("p",{className:"no-reservations",children:["No hay reservas ",w!=="all"?"en este estado":""]}):t.map(n=>{var o,r,i,c;return n.propertyId&&P[n.propertyId],e.jsxs("div",{className:`reservation-card status-${n.status}`,onClick:()=>v(n),children:[e.jsxs("div",{className:"property-info",children:[e.jsx("h4",{children:n.propertyName}),e.jsxs("span",{className:`status status-${n.status}`,children:[n.status==="pending"&&"Pendiente",n.status==="confirmed"&&"Confirmada",n.status==="cancelled"&&"Cancelada",n.status==="completed"&&"Completada"]})]}),e.jsxs("div",{className:"user-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Usuario:"})}),e.jsx("p",{children:n.fullName}),e.jsx("p",{children:n.email})]}),e.jsxs("div",{className:"dates-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Fechas:"})}),e.jsxs("p",{children:[formatDateUTC(n.checkIn)," - ",formatDateUTC(n.checkOut)]}),e.jsxs("p",{children:[Math.ceil((new Date(n.checkOut)-new Date(n.checkIn))/(1e3*60*60*24))," noches"]})]}),e.jsxs("div",{className:"guests-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Huéspedes:"})}),e.jsx("p",{children:n.guests})]}),e.jsxs("div",{className:"payment-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Pago:"})}),e.jsx("p",{children:(o=n.paymentInfo)!=null&&o.provider?n.paymentInfo.provider==="efectivo"?"Pago en Efectivo":n.paymentInfo.provider:"No especificado"}),(()=>{var l,a;const s=S(n);if(s){const d=s.totalAmount,p=Math.round(d*.3);return e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"price-highlight",children:j(s.totalAmount,s.currency)}),((l=n.paymentInfo)==null?void 0:l.provider)==="efectivo"&&n.status==="confirmed"&&e.jsxs("div",{className:"deposit-info",children:[e.jsxs("p",{className:"deposit-paid",children:["Seña: ",j(p,s.currency)]}),e.jsxs("p",{className:"balance-due",children:["Falta pagar: ",j(d-p,s.currency)]})]})]})}else if((a=n.priceInfo)!=null&&a.totalAmount)return e.jsxs("p",{className:"price-info",children:[n.priceInfo.currency==="USD"?"US$":"ARS $",n.priceInfo.totalAmount]});return null})(),e.jsx("p",{className:"payment-status",style:{marginTop:"5px",fontWeight:"bold",color:"#d35400"},children:(r=n.paymentInfo)!=null&&r.provider?n.status==="pending"?"Estado: Seña del 30% pendiente":n.status==="confirmed"?n.paymentInfo.provider==="efectivo"?"Estado: Seña del 30% pagada, 70% al llegar":"Estado: Pago confirmado":n.status==="cancelled"?"Estado: Pago cancelado":"Estado: Pago completado":"Estado: Seña del 30% pendiente"})]}),e.jsxs("div",{className:"contact-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Contacto:"})}),e.jsx("p",{children:n.fullName}),e.jsx("p",{children:n.email}),e.jsx("p",{children:n.phone})]}),e.jsxs("div",{className:"message-preview",children:[e.jsx("p",{children:e.jsx("strong",{children:"Mensaje:"})}),e.jsxs("p",{className:"message-truncate",children:[(i=n.message)==null?void 0:i.substring(0,100),((c=n.message)==null?void 0:c.length)>100?"...":""]}),e.jsx("button",{className:"view-message",onClick:s=>{s.stopPropagation(),M(n.message||"No hay mensaje disponible",n)},children:"Ver completo"})]}),e.jsxs("div",{className:"created-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Creada:"})}),e.jsx("p",{children:(()=>{const s=new Date(n.createdAt),l=String(s.getUTCDate()).padStart(2,"0"),a=String(s.getUTCMonth()+1).padStart(2,"0"),d=s.getUTCFullYear(),p=String(s.getUTCHours()).padStart(2,"0"),h=String(s.getUTCMinutes()).padStart(2,"0");return`${l}/${a}/${d}, ${p}:${h}`})()})]}),e.jsxs("div",{className:"quick-actions",children:[e.jsx("button",{className:"btn btn-sm btn-primary",onClick:()=>v(n),children:"Ver Detalles"}),n.status==="pending"&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-sm btn-success",onClick:s=>{s.stopPropagation(),b(n.id,"confirmed")},children:"✅ OK"}),e.jsx("button",{className:"btn btn-sm btn-danger",onClick:s=>{s.stopPropagation(),b(n.id,"cancelled")},children:"❌ No"})]}),e.jsx("button",{className:"btn btn-sm btn-danger",onClick:s=>{s.stopPropagation(),window.confirm("¿Estás seguro de eliminar esta reserva?")&&(E.delete(n.id),N(l=>l.filter(a=>a.id!==n.id)))},children:"🗑️ Eliminar"})]})]},n.id)})},B=()=>e.jsxs("div",{className:"reservations-stats",children:[e.jsxs("div",{className:"stat-card",children:[e.jsx("h3",{children:x.length}),e.jsx("p",{children:"Total Reservas"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("h3",{children:g.pending.length}),e.jsx("p",{children:"Pendientes"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("h3",{children:g.confirmed.length}),e.jsx("p",{children:"Confirmadas"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("h3",{children:g.cancelled.length}),e.jsx("p",{children:"Canceladas"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("h3",{children:g.completed.length}),e.jsx("p",{children:"Completadas"})]})]}),H=()=>e.jsx("div",{className:"reservations-filters",children:Object.keys(g).map(t=>e.jsxs("button",{className:`filter-btn ${w===t?"active":""}`,onClick:()=>D(t),children:[t==="all"&&"Todas",t==="pending"&&"Pendientes",t==="confirmed"&&"Confirmadas",t==="cancelled"&&"Canceladas",t==="completed"&&"Completadas","(",g[t].length,")"]},t))});return A?e.jsx("div",{className:"loading",children:"Cargando reservas..."}):R?e.jsx("div",{className:"error",children:R}):e.jsxs("div",{className:"reservations-manager",children:[e.jsx("h1",{children:"Gestión de Reservas"}),e.jsx("p",{className:"section-description",children:"Administra todas las reservas del sistema"}),B(),u?F():e.jsxs(e.Fragment,{children:[H(),e.jsx("div",{className:"reservations-list",children:U()})]})]})};export{J as default};
