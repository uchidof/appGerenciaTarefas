const $cru=e=>document.querySelector(e),$crus=e=>document.querySelectorAll(e),$cruConfig={prefix_url:"",headers:{"Content-Type":"application/json"},callbacks:{}},$C=(e=!1)=>{if(e)for(let t of Object.keys(e))$cruConfig[t]=e[t];$cruLoadEvents()},$cruLoadEvents=()=>{$cruLoadRequests(),$cruLoadFormIntercept(),$cruLoadAllContainers()},$cruLoadContainer=async e=>{e.classList.add("loaded");const t=e.closest("[c-container]")||e,r=t.getAttribute("c-container"),c=t.getAttribute("c-target")||!1,a=t.getAttribute("c-type")||"html",n=t.getAttribute("c-callback")||!1,o=await fetch($cruConfig.prefix_url+r,{method:"GET",headers:$cruConfig.headers}),s=await $cruTypeResponse(a,o),i=c?$cru(c):t;(c||"off"!=c)&&(c?i.innerHTML=s:"html"==a&&(i.innerHTML=s)),n&&$cruConfig.callbacks[n](s,i),$cruLoadEvents()},$cruLoadAllContainers=async()=>{$crus("[c-container]:not(.loaded)").forEach(async e=>{e.classList.add("loaded"),$cruLoadContainer(e)}),$crus("[c-reload]:not(.loaded)").forEach(async e=>{e.classList.add("loaded"),e.addEventListener("click",t=>$cruLoadContainer(e))})},cruRequest=async(e,t)=>{const r=e.getAttribute(`c-${t}`),c=e.getAttribute("c-type")||"html",a=e.getAttribute("c-reload-container")||!1,n=e.getAttribute("c-remove-closest")||!1,o=e.getAttribute("c-self-remove")||!1,s=e.getAttribute("c-redirect")||!1,i=e.getAttribute("c-swap")||!1,d=e.getAttribute("c-append")||!1,u=e.getAttribute("c-prepend")||!1,l=e.getAttribute("c-callback")||!1,$=e.getAttribute("c-target")||!1,g=await fetch($cruConfig.prefix_url+r,{method:t,headers:$cruConfig.headers}),L=await $cruTypeResponse(c,g),f=!!$&&$cru($);n&&e.closest(n).remove(),o&&e.remove(),i&&($cru(i).outerHTML=L),d&&$cru(d).insertAdjacentHTML("beforeend",L),u&&$cru(u).insertAdjacentHTML("afterbegin",L),a&&$cruLoadContainer(e),f&&(f?f.innerHTML=L:"html"==c&&(e.innerHTML=L)),l&&$cruConfig.callbacks[l](L,f),$cruLoadEvents(),s&&(window.location.href=s)},$cruLoadRequests=()=>{$crus("[c-delete]:not(.loaded)").forEach(e=>{e.classList.add("loaded"),e.addEventListener("click",async t=>{cruRequest(e,"delete")})}),$crus("[c-put]:not(.loaded)").forEach(e=>{e.classList.add("loaded"),e.addEventListener("click",async t=>{cruRequest(e,"put")})}),$crus("[c-get]:not(.loaded)").forEach(e=>{e.classList.add("loaded"),e.addEventListener("click",async t=>{cruRequest(e,"get")})}),$crus("[c-post]:not(.loaded)").forEach(e=>{e.classList.add("loaded"),e.addEventListener("click",async t=>{cruRequest(e,"post")})})},$cruLoadFormIntercept=()=>{$crus(".c-form:not(.loaded)").forEach(e=>{e.classList.add("loaded"),e.addEventListener("submit",async t=>{t.preventDefault();const r=e.getAttribute("action"),c=e.getAttribute("method").toUpperCase()||"POST",a=e.getAttribute("c-type")||"html",n=e.getAttribute("c-append")||!1,o=e.getAttribute("c-prepend")||!1,s=e.getAttribute("c-redirect")||!1,i=e.getAttribute("c-reset")||!1,d=e.getAttribute("c-swap")||!1,u=e.getAttribute("c-target")||!1,l=e.getAttribute("c-reload-container")||!1,$=e.getAttribute("c-callback")||!1,g=$cruIsRead(c),L=Object.fromEntries(new FormData(t.target).entries()),f=cruFormatURL(r,g,L),b=await fetch(f,{method:c,headers:$cruConfig.headers,body:g?null:JSON.stringify(L)}),p=await $cruTypeResponse(a,b);d&&($cru(d).outerHTML=p),n&&$cru(n).insertAdjacentHTML("beforeend",p),o&&$cru(o).insertAdjacentHTML("afterbegin",p),u&&($cru(u).innerHTML=p),i&&e.reset(),l&&$cruLoadContainer(e),$&&$cruConfig.callbacks[$]({status:b.status,data:p},e),$cruLoadEvents(),s&&(window.location.href=s)})})},cruFormatURL=(e,t,r)=>{let c=$cruConfig.prefix_url+e;if(t)try{c=new URL(e)}catch(t){try{c=new URL(window.location.origin+e)}catch(t){throw e}}finally{c.search=new URLSearchParams(r).toString(),c=c.href}return c},$cruCallback=(e,t)=>{$cruConfig.callbacks[e]=t},$cruIsRead=e=>["GET","HEAD"].includes(e),$cruTypeResponse=async(e,t)=>"html"==e?await t.text():await t.json();$C();
let taskIdToDelete = null;

// Define o ID da tarefa para exclusão
function setTaskIdToDelete(taskId) {
    taskIdToDelete = taskId;
}

// Ação ao confirmar a exclusão no modal
document.getElementById("confirmDelete").addEventListener("click", function () {
    if (taskIdToDelete) {
        const deleteButton = document.createElement("div");
        deleteButton.setAttribute("c-delete", `/tarefas/${taskIdToDelete}/delete`);
        cruRequest(deleteButton, "delete");

        // Aguarda um pequeno delay para garantir que a requisição foi concluída antes de recarregar
        setTimeout(() => {
            location.reload();
        }, 500);
        
        // Fecha o modal
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        deleteModal.hide();
    }
});

/*


async function handleCreateTask(formElement) {
    const errorElement = formElement.querySelector("#form-error");  // Seleciona o elemento de erro

    // Limpa mensagens de erro anteriores
    errorElement.style.display = "none";  // Esconde a mensagem de erro anterior
    errorElement.textContent = "";        // Limpa o texto da mensagem de erro

    // Captura os dados do formulário
    const formData = Object.fromEntries(new FormData(formElement).entries());

    try {
        // Envia a requisição ao servidor
        const response = await fetch(formElement.action, {
            method: formElement.method,  // Usa o método POST ou PUT
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            // Se o backend retornou sucesso, processa a resposta
            const contentType = response.headers.get("content-type");
            let responseData;

            // Verifica se a resposta é JSON ou HTML
            if (contentType && contentType.includes("application/json")) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            // Atualiza o conteúdo da página com a resposta do servidor
            if (formElement.getAttribute("c-append")) {
                const appendTarget = document.querySelector(formElement.getAttribute("c-append"));
                appendTarget.insertAdjacentHTML("beforeend", responseData);
            }

            if (formElement.getAttribute("c-swap")) {
                const swapTarget = document.querySelector(formElement.getAttribute("c-swap"));
                swapTarget.outerHTML = responseData;
            }

            // Limpa o formulário após o sucesso
            formElement.reset();

        } else {
            // Exibe a mensagem de erro retornada pelo backend
            const errorData = await response.json();
            if (errorData.error) {
                errorElement.textContent = errorData.error; // Define o texto do erro
                errorElement.style.display = "block";        // Exibe o erro
            }
        }

    } catch (error) {
        // Exibe mensagens de erro inesperadas no caso de falha de rede ou outro erro
        errorElement.textContent = "Erro ao processar a solicitação. Por favor, tente novamente.";
        errorElement.style.display = "block";  // Exibe o erro genérico
    }
}

*/