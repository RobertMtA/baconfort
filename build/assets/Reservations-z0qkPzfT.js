import{j as e}from"./bootstrap-Bhj38lrG.js";import{r as f}from"./vendor-vT5NdfSc.js";import{u as W,r as k,c as S,f as y}from"./index-BRpFmTyN.js";import"./icons-okTEACyS.js";const V=`
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
`,J=()=>{f.useEffect(()=>{const t=document.createElement("style");return t.innerHTML=V,document.head.appendChild(t),()=>{document.head.removeChild(t)}},[]);const[h,b]=f.useState([]),[D,I]=f.useState(!0),[R,A]=f.useState(null),[E,z]=f.useState("all"),[x,j]=f.useState(null),{getAllProperties:M}=W(),P=M();f.useEffect(()=>{(async()=>{I(!0);try{const s=await k.getAll();s&&s.data&&(console.log("Reservas cargadas:",s.data),b(s.data))}catch(s){console.error("Error cargando reservas:",s),A("Error al cargar las reservas")}finally{I(!1)}})()},[]);const u={all:h,pending:h.filter(t=>t.status==="pending"),confirmed:h.filter(t=>t.status==="confirmed"),cancelled:h.filter(t=>t.status==="cancelled"),completed:h.filter(t=>t.status==="completed")},v=async(t,s)=>{try{await k.updateStatus(t,s),b(a=>a.map(o=>o.id===t?{...o,status:s}:o)),x&&x.id===t&&j(a=>({...a,status:s})),alert(`Reserva ${t} actualizada a estado: ${s}`)}catch(a){console.error("Error actualizando estado de reserva:",a),alert("Error al actualizar el estado de la reserva")}},T=async t=>{var s,a;try{const o=h.find(l=>l.id===t),i=S(o),d=(i==null?void 0:i.totalAmount)||((s=o.priceInfo)==null?void 0:s.totalAmount)||0,r={provider:"efectivo",paymentMethod:"cash",amount:Math.round(d*.3),isDeposit:!0,depositPercentage:30,totalAmount:d,currency:(i==null?void 0:i.currency)||((a=o.priceInfo)==null?void 0:a.currency)||"ARS",paymentStatus:"approved"};await k.updatePayment(t,r),b(l=>l.map(c=>c.id===t?{...c,paymentInfo:r}:c)),x&&x.id===t&&j(l=>({...l,paymentInfo:r})),alert(`Seña del 30% en efectivo registrada para la reserva ${t}. Resto del pago al momento del check-in.`)}catch(o){console.error("Error actualizando información de pago:",o),alert("Error al actualizar la información de pago")}},F=(t,s=null)=>{const a=document.createElement("div");a.style.position="fixed",a.style.top="0",a.style.left="0",a.style.width="100%",a.style.height="100%",a.style.backgroundColor="rgba(0,0,0,0.5)",a.style.display="flex",a.style.justifyContent="center",a.style.alignItems="center",a.style.zIndex="9999";const o=document.createElement("div");o.style.backgroundColor="white",o.style.padding="30px",o.style.borderRadius="12px",o.style.maxWidth="650px",o.style.width="85%",o.style.maxHeight="85vh",o.style.overflowY="auto",o.style.boxShadow="0 6px 25px rgba(0,0,0,0.3)";const i=document.createElement("div");i.style.display="flex",i.style.justifyContent="space-between",i.style.alignItems="center",i.style.marginBottom="25px",i.style.borderBottom="2px solid #eee",i.style.paddingBottom="15px";const d=document.createElement("h3");d.textContent="Mensaje de Reserva",d.style.margin="0",d.style.fontSize="22px",d.style.fontWeight="600",d.style.color="#2c3e50";const n=document.createElement("button");n.textContent="✕",n.style.background="none",n.style.border="none",n.style.fontSize="22px",n.style.cursor="pointer",n.style.color="#666",n.style.padding="5px 10px",n.style.borderRadius="5px",n.style.transition="background-color 0.2s",n.onmouseover=()=>n.style.backgroundColor="#f1f1f1",n.onmouseout=()=>n.style.backgroundColor="transparent",n.onclick=()=>document.body.removeChild(a);const r=document.createElement("div");r.style.marginBottom="25px",r.style.display="grid",r.style.gridTemplateColumns="repeat(2, 1fr)",r.style.gap="15px";const l=document.createElement("div");if(l.style.lineHeight="1.6",l.style.color="#333",l.style.backgroundColor="#f9f9f9",l.style.padding="15px",l.style.borderRadius="8px",l.style.marginTop="15px",i.appendChild(d),i.appendChild(n),o.appendChild(i),s){const p=(O,U)=>{const N=document.createElement("div");N.style.marginBottom="12px";const g=document.createElement("span");g.textContent=O+":",g.style.display="block",g.style.fontWeight="bold",g.style.color="#555",g.style.fontSize="14px",g.style.marginBottom="5px";const m=document.createElement("span");return m.textContent=U||"No especificado",m.style.display="block",m.style.fontSize="16px",m.style.color="#333",m.style.backgroundColor="#f8f9fa",m.style.padding="8px 12px",m.style.borderRadius="4px",m.style.border="1px solid #e9ecef",N.appendChild(g),N.appendChild(m),N},C=document.createElement("div");C.appendChild(p("Propiedad",s.propertyName)),C.appendChild(p("Cliente",s.fullName)),C.appendChild(p("Email",s.email));const w=document.createElement("div");w.appendChild(p("Teléfono",s.phone)),w.appendChild(p("Fecha",new Date(s.createdAt).toLocaleString("es-ES"))),r.appendChild(C),r.appendChild(w),o.appendChild(r)}const c=document.createElement("h4");c.textContent="Mensaje:",c.style.margin="15px 0 10px",c.style.fontSize="16px",c.style.color="#444",o.appendChild(c),l.textContent=t,o.appendChild(l),a.appendChild(o),a.addEventListener("click",p=>{p.target===a&&document.body.removeChild(a)}),document.body.appendChild(a)},L=()=>{var d,n;if(!x)return null;const t=x,s=P[t.propertyId]||{title:t.propertyName||"Propiedad no encontrada"},a=new Date(t.checkIn).toLocaleDateString("es-ES"),o=new Date(t.checkOut).toLocaleDateString("es-ES"),i=Math.ceil((new Date(t.checkOut)-new Date(t.checkIn))/(1e3*60*60*24));return e.jsxs("div",{className:"reservation-details",children:[e.jsx("h3",{children:"Detalles de la Reserva"}),e.jsxs("div",{className:"details-grid",children:[e.jsxs("div",{className:"detail-group",children:[e.jsx("h4",{children:"Información de Propiedad"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Propiedad:"})," ",s.title]}),e.jsxs("p",{children:[e.jsx("strong",{children:"ID Propiedad:"})," ",t.propertyId]})]}),e.jsxs("div",{className:"detail-group",children:[e.jsx("h4",{children:"Fechas y Huéspedes"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Check-in:"})," ",a]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Check-out:"})," ",o]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Noches:"})," ",i]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Huéspedes:"})," ",t.guests]})]}),e.jsxs("div",{className:"detail-group",children:[e.jsx("h4",{children:"Información del Cliente"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Nombre:"})," ",t.fullName]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Email:"})," ",t.email]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Teléfono:"})," ",t.phone||"No especificado"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"ID:"})," ",t.idType==="dni"?"DNI":"Pasaporte"," ",t.dni]})]}),e.jsxs("div",{className:"detail-group",children:[e.jsx("h4",{children:"Estado y Pago"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Estado:"}),e.jsxs("span",{className:`status status-${t.status}`,children:[t.status==="pending"&&"Pendiente",t.status==="confirmed"&&"Confirmada",t.status==="cancelled"&&"Cancelada",t.status==="completed"&&"Completada"]})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Pago:"}),(d=t.paymentInfo)!=null&&d.provider?e.jsx("span",{children:t.paymentInfo.provider==="efectivo"?"Efectivo":t.paymentInfo.provider}):e.jsx("span",{className:"no-payment",children:"No especificado"})]}),(()=>{const r=S(t);return r?e.jsxs("div",{className:"price-section",children:[e.jsx("p",{className:"price-title",children:e.jsx("strong",{children:"Precio calculado:"})}),e.jsx("p",{className:"price-value",children:y(r.totalAmount,r.currency)}),e.jsxs("p",{className:"price-detail",children:[r.nights," noches x ",y(r.pricePerNight,r.currency),"/noche",e.jsxs("span",{className:"price-period",children:["Tarifa ",r.period==="daily"?"diaria":r.period==="weekly"?"semanal":"mensual"]})]}),e.jsxs("p",{className:"deposit-value",children:[e.jsx("strong",{children:"Seña (30%):"})," ",y(Math.round(r.totalAmount*.3),r.currency)]})]}):t.priceInfo?e.jsxs("p",{children:[e.jsx("strong",{children:"Monto:"})," ",t.priceInfo.currency," $",t.priceInfo.totalAmount]}):null})()]})]}),e.jsxs("div",{className:"message-box",children:[e.jsx("h4",{children:"Mensaje del Cliente"}),e.jsx("p",{children:t.message})]}),e.jsxs("div",{className:"action-buttons",children:[t.status==="pending"&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"action-btn confirm-btn",onClick:()=>v(t.id,"confirmed"),children:"✅ Confirmar Reserva"}),e.jsx("button",{className:"action-btn reject-btn",onClick:()=>v(t.id,"cancelled"),children:"❌ Rechazar Reserva"})]}),["pending","confirmed"].includes(t.status)&&!((n=t.paymentInfo)!=null&&n.provider)&&e.jsx("button",{className:"action-btn cash-btn",onClick:()=>T(t.id),children:"💵 Registrar Seña 30% en Efectivo"}),t.status==="confirmed"&&e.jsx("button",{className:"action-btn complete-btn",onClick:()=>v(t.id,"completed"),children:"🏁 Marcar como Completada"}),e.jsx("button",{className:"action-btn close-btn",onClick:()=>j(null),children:"⬅️ Volver a la Lista"})]})]})},$=()=>{const t=u[E]||[];return t.length===0?e.jsxs("p",{className:"no-reservations",children:["No hay reservas ",E!=="all"?"en este estado":""]}):t.map(s=>{var a,o,i,d;return s.propertyId&&P[s.propertyId],e.jsxs("div",{className:`reservation-card status-${s.status}`,onClick:()=>j(s),children:[e.jsxs("div",{className:"property-info",children:[e.jsx("h4",{children:s.propertyName}),e.jsxs("span",{className:`status status-${s.status}`,children:[s.status==="pending"&&"Pendiente",s.status==="confirmed"&&"Confirmada",s.status==="cancelled"&&"Cancelada",s.status==="completed"&&"Completada"]})]}),e.jsxs("div",{className:"user-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Usuario:"})}),e.jsx("p",{children:s.fullName}),e.jsx("p",{children:s.email})]}),e.jsxs("div",{className:"dates-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Fechas:"})}),e.jsxs("p",{children:[new Date(s.checkIn).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"})," - ",new Date(s.checkOut).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"})]}),e.jsxs("p",{children:[Math.ceil((new Date(s.checkOut)-new Date(s.checkIn))/(1e3*60*60*24))," noches"]})]}),e.jsxs("div",{className:"guests-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Huéspedes:"})}),e.jsx("p",{children:s.guests})]}),e.jsxs("div",{className:"payment-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Pago:"})}),e.jsx("p",{children:(a=s.paymentInfo)!=null&&a.provider?s.paymentInfo.provider==="efectivo"?"Pago en Efectivo":s.paymentInfo.provider:"No especificado"}),(()=>{var r,l;const n=S(s);if(n){const c=n.totalAmount,p=Math.round(c*.3);return e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"price-highlight",children:y(n.totalAmount,n.currency)}),((r=s.paymentInfo)==null?void 0:r.provider)==="efectivo"&&s.status==="confirmed"&&e.jsxs("div",{className:"deposit-info",children:[e.jsxs("p",{className:"deposit-paid",children:["Seña: ",y(p,n.currency)]}),e.jsxs("p",{className:"balance-due",children:["Falta pagar: ",y(c-p,n.currency)]})]})]})}else if((l=s.priceInfo)!=null&&l.totalAmount)return e.jsxs("p",{className:"price-info",children:[s.priceInfo.currency==="USD"?"US$":"ARS $",s.priceInfo.totalAmount]});return null})(),e.jsx("p",{className:"payment-status",style:{marginTop:"5px",fontWeight:"bold",color:"#d35400"},children:(o=s.paymentInfo)!=null&&o.provider?s.status==="pending"?"Estado: Seña del 30% pendiente":s.status==="confirmed"?s.paymentInfo.provider==="efectivo"?"Estado: Seña del 30% pagada, 70% al llegar":"Estado: Pago confirmado":s.status==="cancelled"?"Estado: Pago cancelado":"Estado: Pago completado":"Estado: Seña del 30% pendiente"})]}),e.jsxs("div",{className:"contact-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Contacto:"})}),e.jsx("p",{children:s.fullName}),e.jsx("p",{children:s.email}),e.jsx("p",{children:s.phone})]}),e.jsxs("div",{className:"message-preview",children:[e.jsx("p",{children:e.jsx("strong",{children:"Mensaje:"})}),e.jsxs("p",{className:"message-truncate",children:[(i=s.message)==null?void 0:i.substring(0,100),((d=s.message)==null?void 0:d.length)>100?"...":""]}),e.jsx("button",{className:"view-message",onClick:n=>{n.stopPropagation(),F(s.message||"No hay mensaje disponible",s)},children:"Ver completo"})]}),e.jsxs("div",{className:"created-info",children:[e.jsx("p",{children:e.jsx("strong",{children:"Creada:"})}),e.jsxs("p",{children:[new Date(s.createdAt).toLocaleDateString("es-ES"),", ",new Date(s.createdAt).toLocaleTimeString("es-ES")]})]}),e.jsxs("div",{className:"quick-actions",children:[e.jsx("button",{className:"btn btn-sm btn-primary",onClick:()=>j(s),children:"Ver Detalles"}),s.status==="pending"&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-sm btn-success",onClick:n=>{n.stopPropagation(),v(s.id,"confirmed")},children:"✅ OK"}),e.jsx("button",{className:"btn btn-sm btn-danger",onClick:n=>{n.stopPropagation(),v(s.id,"cancelled")},children:"❌ No"})]}),e.jsx("button",{className:"btn btn-sm btn-danger",onClick:n=>{n.stopPropagation(),window.confirm("¿Estás seguro de eliminar esta reserva?")&&(k.delete(s.id),b(r=>r.filter(l=>l.id!==s.id)))},children:"🗑️ Eliminar"})]})]},s.id)})},B=()=>e.jsxs("div",{className:"reservations-stats",children:[e.jsxs("div",{className:"stat-card",children:[e.jsx("h3",{children:h.length}),e.jsx("p",{children:"Total Reservas"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("h3",{children:u.pending.length}),e.jsx("p",{children:"Pendientes"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("h3",{children:u.confirmed.length}),e.jsx("p",{children:"Confirmadas"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("h3",{children:u.cancelled.length}),e.jsx("p",{children:"Canceladas"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("h3",{children:u.completed.length}),e.jsx("p",{children:"Completadas"})]})]}),H=()=>e.jsx("div",{className:"reservations-filters",children:Object.keys(u).map(t=>e.jsxs("button",{className:`filter-btn ${E===t?"active":""}`,onClick:()=>z(t),children:[t==="all"&&"Todas",t==="pending"&&"Pendientes",t==="confirmed"&&"Confirmadas",t==="cancelled"&&"Canceladas",t==="completed"&&"Completadas","(",u[t].length,")"]},t))});return D?e.jsx("div",{className:"loading",children:"Cargando reservas..."}):R?e.jsx("div",{className:"error",children:R}):e.jsxs("div",{className:"reservations-manager",children:[e.jsx("h1",{children:"Gestión de Reservas"}),e.jsx("p",{className:"section-description",children:"Administra todas las reservas del sistema"}),B(),x?L():e.jsxs(e.Fragment,{children:[H(),e.jsx("div",{className:"reservations-list",children:$()})]})]})};export{J as default};
