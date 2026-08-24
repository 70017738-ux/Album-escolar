// ========================================================
// PANEL ADMINISTRADOR Y DOCENTE (GENERADOR TIPO A)
// ========================================================

window.actualizarPanelAdmin = function() {
    const tablaBody = document.getElementById('users-table-body');
    const selectMensajes = document.getElementById('msg-target-user');
    
    if (tablaBody && selectMensajes) {
        tablaBody.innerHTML = '';
        selectMensajes.innerHTML = '<option value="">-- Seleccionar Usuario --</option>';
        
        listaUsuariosGlobal.forEach(u => {
            if (u.tipo === 'ADMIN') return;
            
            const opcion = document.createElement('option');
            opcion.value = u.usuario;
            opcion.textContent = u.usuario;
            selectMensajes.appendChild(opcion);
            
            const fila = document.createElement('tr');
            const textoBotonPermiso = u.permitido ? 'Quitar Permiso' : 'Dar Permiso';
            const textoBotonBloqueo = u.bloqueado ? 'Desbloquear' : 'Bloquear';
            
            fila.innerHTML = `
                <td><strong>${u.usuario}</strong></td>
                <td><code>${u.contrasena}</code></td>
                <td>Tipo ${u.tipo}</td>
                <td>${u.permitido ? '<span style="color:green">Aprobado ✓</span>' : '<span style="color:orange">Pendiente ⏳</span>'}</td>
                <td>${u.bloqueado ? '<span style="color:red">Bloqueado 🚫</span>' : '<span style="color:gray">Activo</span>'}</td>
                <td>
                    <button onclick="cambiarPermiso('${u.usuario}')">${textoBotonPermiso}</button>
                    <button style="background-color: #f59e0b;" onclick="cambiarBloqueo('${u.usuario}')">${textoBotonBloqueo}</button>
                    <button class="logout-btn" onclick="eliminarUsuario('${u.usuario}')">Eliminar 🗑️</button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });
    }

    // Monitoreo en tiempo real del progreso de alumnos
    const contenedorProgresoDocente = document.getElementById('lista-progreso-alumnos');
    if (contenedorProgresoDocente) {
        contenedorProgresoDocente.innerHTML = '';
        
        listaUsuariosGlobal.forEach(u => {
            if (u.tipo !== 'B') return;
            
            const alb = u.album ? u.album.filter(id => id !== "") : [];
            const totalFiguras = 20;
            const porcentaje = Math.round((alb.length / totalFiguras) * 100) || 0;
            const puntos = u.puntos || 0;

            const fila = document.createElement('div');
            fila.className = 'fila-alumno-progreso';
            fila.innerHTML = `
                <div class="info-alumno-docente">
                    👤 <strong>${u.usuario}</strong> <br>
                    <span style="font-size:0.8rem; color:#64748b;">Puntos ganados: ⭐ ${puntos}</span>
                </div>
                <div class="barra-docente-container">
                    <div class="barra-docente-llena" style="width: ${porcentaje}%;"></div>
                </div>
                <div class="porcentaje-docente-txt">
                    ${porcentaje}% (${alb.length}/${totalFiguras})
                </div>
            `;
            contenedorProgresoDocente.appendChild(fila);
        });
    }
};

window.cambiarPermiso = function(nombreUsuario) {
    const indice = listaUsuariosGlobal.findIndex(u => u.usuario === nombreUsuario);
    if (indice !== -1) {
        listaUsuariosGlobal[indice].permitido = !listaUsuariosGlobal[indice].permitido;
        guardarUsuariosEnNube(listaUsuariosGlobal);
    }
};

window.cambiarBloqueo = function(nombreUsuario) {
    const indice = listaUsuariosGlobal.findIndex(u => u.usuario === nombreUsuario);
    if (indice !== -1) {
        listaUsuariosGlobal[indice].bloqueado = !listaUsuariosGlobal[indice].bloqueado;
        guardarUsuariosEnNube(listaUsuariosGlobal);
    }
};

window.eliminarUsuario = function(nombreUsuario) {
    if (confirm(`¿Eliminar a "${nombreUsuario}"?`)) {
        listaUsuariosGlobal = listaUsuariosGlobal.filter(u => u.usuario !== nombreUsuario);
        guardarUsuariosEnNube(listaUsuariosGlobal);
    }
};

const sendMsgBtn = document.getElementById('send-msg-btn');
if (sendMsgBtn) {
    sendMsgBtn.addEventListener('click', function() {
        const usuarioDestino = document.getElementById('msg-target-user').value;
        const textoMensaje = document.getElementById('admin-msg-text').value.trim();
        
        if (!usuarioDestino || !textoMensaje) return;
        
        const indice = listaUsuariosGlobal.findIndex(u => u.usuario === usuarioDestino);
        if (indice !== -1) {
            if(!listaUsuariosGlobal[indice].mensajes || listaUsuariosGlobal[indice].mensajes[0] === "") {
                listaUsuariosGlobal[indice].mensajes = [];
            }
            listaUsuariosGlobal[indice].mensajes.push(textoMensaje);
            guardarUsuariosEnNube(listaUsuariosGlobal);
            alert('Mensaje enviado en la nube.');
            document.getElementById('admin-msg-text').value = '';
        }
    });
}

// LOGICA DE DOCENTE / USUARIO TIPO A
let figurasSeleccionadasIds = [];

const generateFigBtn = document.getElementById('generate-fig-btn');
if (generateFigBtn) {
    generateFigBtn.addEventListener('click', function() {
        const indiceAzar = Math.floor(Math.random() * BANCO_FIGURAS.length);
        const figuraGenerada = BANCO_FIGURAS[indiceAzar];
        
        const indiceU = listaUsuariosGlobal.findIndex(u => u.usuario === usuarioActual.usuario);
        if (indiceU === -1) return;
        
        const nuevaCopiaFigura = {
            ...figuraGenerada,
            instanciaId: 'inst_' + Date.now() + Math.random().toString(36).substr(2, 4)
        };
        
        if (!listaUsuariosGlobal[indiceU].inventario || listaUsuariosGlobal[indiceU].inventario[0] === "") {
            listaUsuariosGlobal[indiceU].inventario = [];
        }
        
        listaUsuariosGlobal[indiceU].inventario.push(nuevaCopiaFigura);
        guardarUsuariosEnNube(listaUsuariosGlobal);
        
        const esHolografica = IDS_HOLOGRAFICOS.includes(nuevaCopiaFigura.id);
        
        const display = document.getElementById('generated-fig-display');
        if (display) {
            display.className = esHolografica ? 'figura-holografica' : '';
            display.innerHTML = `<div class="shape ${nuevaCopiaFigura.clase}"></div><span>${nuevaCopiaFigura.nombre}</span>`;
        }
    });
}

window.actualizarInventarioA = function() {
    const contenedor = document.getElementById('userA-inventory');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    figurasSeleccionadasIds = [];
    
    const inv = usuarioActual.inventario ? usuarioActual.inventario.filter(f => f !== "") : [];
    
    if (inv.length === 0) {
        contenedor.innerHTML = '<p style="color:#64748b;">No tienes figuras.</p>';
        return;
    }
    
    inv.forEach(fig => {
        const esHolografica = IDS_HOLOGRAFICOS.includes(fig.id);

        const card = document.createElement('div');
        card.className = `figura-card ${esHolografica ? 'figura-holografica' : ''}`;
        card.innerHTML = `<div class="shape ${fig.clase}"></div><span>${fig.nombre}</span>`;
        
        card.addEventListener('click', function() {
            if (card.classList.contains('active')) {
                card.classList.remove('active');
                figurasSeleccionadasIds = figurasSeleccionadasIds.filter(id => id !== fig.instanciaId);
            } else {
                if (figurasSeleccionadasIds.length >= 5) return;
                card.classList.add('active');
                figurasSeleccionadasIds.push(fig.instanciaId);
            }
        });
        contenedor.appendChild(card);
    });
};

window.actualizarSelectUsuariosB = function() {
    const select = document.getElementById('send-target-user');
    if (!select) return;
    select.innerHTML = '<option value="">-- Seleccionar Destinatario B --</option>';
    
    listaUsuariosGlobal.forEach(u => {
        if (u.tipo === 'B' && u.permitido) {
            const opt = document.createElement('option');
            opt.value = u.usuario;
            opt.textContent = u.usuario;
            select.appendChild(opt);
        }
    });
};

const sendFigsBtn = document.getElementById('send-figs-btn');
if (sendFigsBtn) {
    sendFigsBtn.addEventListener('click', function() {
        const usuarioDestino = document.getElementById('send-target-user').value;
        if (!usuarioDestino || figurasSeleccionadasIds.length === 0) return;
        
        const indiceA = listaUsuariosGlobal.findIndex(u => u.usuario === usuarioActual.usuario);
        const indiceB = listaUsuariosGlobal.findIndex(u => u.usuario === usuarioDestino);
        
        const invA = listaUsuariosGlobal[indiceA].inventario.filter(f => f !== "");
        const figurasParaEnviar = invA.filter(fig => figurasSeleccionadasIds.includes(fig.instanciaId));
        
        listaUsuariosGlobal[indiceA].inventario = invA.filter(fig => !figurasSeleccionadasIds.includes(fig.instanciaId));
        if (listaUsuariosGlobal[indiceA].inventario.length === 0) listaUsuariosGlobal[indiceA].inventario = [""];
        
        if (!listaUsuariosGlobal[indiceB].inventario || listaUsuariosGlobal[indiceB].inventario[0] === "") {
            listaUsuariosGlobal[indiceB].inventario = [];
        }
        listaUsuariosGlobal[indiceB].inventario.push(...figurasParaEnviar);
        
        guardarUsuariosEnNube(listaUsuariosGlobal);
        alert('¡Figuras enviadas por internet instantáneamente!');
        figurasSeleccionadasIds = [];
        
        const display = document.getElementById('generated-fig-display');
        if (display) {
            display.innerHTML = '';
            display.className = ''; 
        }
        
        window.actualizarInventarioA();
    });
}
// ========================================================
// 💾 ENLACE DIRECTO DE ADMIN A LA BASE DE DATOS FIREBASE
// ========================================================
function guardarUsuariosEnNube(nuevaLista) {
    if (typeof db !== 'undefined') {
        db.ref('usuarios').set(nuevaLista)
            .then(() => {
                console.log("¡Panel de Control sincronizado en Firebase!");
            })
            .catch((error) => {
                console.error("Error al guardar desde Admin:", error);
            });
    } else {
        console.error("Error: La base de datos Firebase ('db') no está definida en este entorno.");
    }
}
