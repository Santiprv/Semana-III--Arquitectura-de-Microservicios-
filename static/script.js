document.addEventListener('DOMContentLoaded', function() {
    const selector = document.querySelector('#diseño');
    const body = document.querySelector('body');

    selector.addEventListener('change', function() {
        if (this.value === 'black') {
            body.style.backgroundColor = '#131314';
            body.style.color = 'white';
        } else {
            body.style.backgroundColor = 'white';
            body.style.color = '#1f1f1f';
        }
    });
});


function mostrarPreview() {
    const file = document.getElementById('file-input').files[0];
    const preview = document.getElementById('file-preview');
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div class="relative group">
                    <img src="${e.target.result}" class="h-20 w-20 object-cover rounded-lg border border-gray-600">
                    <button onclick="limpiarArchivo()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-lg">×</button>
                </div>`;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function limpiarArchivo() {
    document.getElementById('file-input').value = '';
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('file-preview').innerHTML = '';
}

async function enviarMensaje() {
    const input = document.getElementById('user-input');
    const fileInput = document.getElementById('file-input');
    const chatWindow = document.getElementById('chat-window');
    const welcome = document.getElementById('welcome-message');

    if (!input.value.trim() && !fileInput.files[0]) return;

    if (welcome) welcome.style.display = 'none';

    
    const userMsg = input.value;
    chatWindow.innerHTML += `
        <div class="flex flex-col items-end mb-4">
            <div class="bg-[#2f2f2f] p-4 rounded-2xl max-w-[80%] text-white shadow-sm">
                ${userMsg}
            </div>
        </div>`;
    
    const formData = new FormData();
    formData.append('pregunta', userMsg);
    if (fileInput.files[0]) {
        formData.append('archivo', fileInput.files[0]);
    }

    input.value = '';
    input.style.height = 'auto';
    limpiarArchivo();

    
    const aiMsgId = 'msg-' + Date.now();
    chatWindow.innerHTML += `
        <div class="flex flex-col items-start mb-4">
            <div id="${aiMsgId}" class="bg-transparent p-4 rounded-2xl max-w-[90%] text-gray-200 border border-gray-800">
                <span class="animate-pulse">✨ Generando respuesta...</span>
            </div>
        </div>`;
    
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const res = await fetch('http://localhost:5000/preguntar', {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        const aiDiv = document.getElementById(aiMsgId);

        aiDiv.innerHTML = data.respuesta.replace(/\n/g, '<br>');

        if (data.tokens) {
            document.getElementById('t-in').innerText = data.tokens.entrada;
            document.getElementById('t-out').innerText = data.tokens.salida;
            document.getElementById('t-total').innerText = data.tokens.total;
        }

    } catch (e) {
        document.getElementById(aiMsgId).innerText = "Error: No se pudo conectar con el servidor.";
    }
    
    chatWindow.scrollTop = chatWindow.scrollHeight;
}