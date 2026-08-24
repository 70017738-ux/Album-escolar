// ========================================================
// CONTROL DE AUTENTICACIÓN, SESIONES Y PERSISTENCIA (F5)
// ========================================================
const formularioRegistro = document.getElementById('register-form');
const formularioLogin = document.getElementById('login-form');
const mensajeAuth = document.getElementById('auth-message');
const pantallaAuth = document.getElementById('auth-screen');

// ⚡ [CORRECCIÓN F5 INSTANTÁNEO] Comprobación Flash antes de esperar a Firebase
(function comprobacionFlashSesion() {
    const usuarioGuardado = localStorage.getItem(CLAVE_SESION_PESTANA);
    if (usuarioGuardado) {
        if (pantallaAuth) pantallaAuth.classList.add('hidden');
    }
})();

// Inicializador de Persistencia con .once() para saltarse la cola de carga lenta en F5
function inicializarPersistenciaF5() {
    const usuarioGuardado = localStorage.getItem(CLAVE_SESION_PESTANA);

    // Hacemos una consulta rápida (once) solo para reconstruir la lista de validación inicial
    db.ref('usuarios').once('value', (snapshot) => {
        const datos = snapshot.val();
        
        if (!datos) {
            listaUsuariosGlobal = [{
                usuario: 'adm',
                contrasena: 'adm',
                tipo: 'ADMIN',
                permitido: true,
                bloqueado: false,
                mensajes: []
            }];
            db.ref('usuarios').set(listaUsuariosGlobal);
            return;
        }
        
        listaUsuariosGlobal = Object.values(datos);

        // Si hay sesión en localStorage, la restauramos a la velocidad de la luz
        if (!usuarioActual && usuarioGuardado) {
            const usuarioSesion = listaUsuariosGlobal.find(u => u.usuario === usuarioGuardado);
            if (usuarioSesion) {
                if (!usuarioSesion.bloqueado && (usuarioSesion.permitido || usuarioSesion.tipo === 'ADMIN')) {
                    usuarioActual = usuarioSesion;
                    cargarPantallaUsuario(usuarioActual);
                    // Encendemos los canales en vivo específicos una vez dentro
                    activarSincronizacionEnVivo();
                } else {
                    forzarCierreSesion('Tu cuenta no está autorizada o fue bloqueada.');
                }
            } else {
                forzarCierreSesion('');
            }
        } else {
            // Si no hay sesión guardada, garantizamos que el login se vea sin trabas
            if (pantallaAuth) pantallaAuth.classList.remove('hidden');
        }
    });
}

// 🌐 CANALES EN VIVO: Se activan por separado para no congelar la carga inicial
function activarSincronizacionEnVivo() {
    db.ref('usuarios').on('value', (snapshot) => {
        const datos = snapshot.val();
        if (!datos) return;

        listaUsuariosGlobal = Object.values(datos);

        if (usuarioActual) {
            const usuarioRefrescado = listaUsuariosGlobal.find(u => u.usuario === usuarioActual.usuario);
            if (usuarioRefrescado) {
                if (usuarioRefrescado.bloqueado || (!usuarioRefrescado.permitido && usuarioRefrescado.tipo !== 'ADMIN')) {
                    forzarCierreSesion('Tu cuenta ha cambiado de estado o fue bloqueada.');
                    return;
                }
                usuarioActual = usuarioRefrescado;
                actualizarPantallaSegunDatos();
            }
        }

        // 📊 [LOGICA DEL DOCENTE] Renderiza el avance de los alumnos en tiempo real sin retrasar el Login
        const pantallaDocente = document.getElementById('userA-screen');
        if (pantallaDocente && !pantallaDocente.classList.contains('hidden')) {
            dibujarProgresoAlumnosParaDocente(listaUsuariosGlobal);
        }

        const adminScreen = document.getElementById('admin-screen');
        if (adminScreen && !adminScreen.classList.contains('hidden') && typeof window.actualizarPanelAdmin === 'function') {
            window.actualizarPanelAdmin();
        }
    });
}

// 📊 FUNCIÓN AUXILIAR PARA MOSTRAR LAS BARRAS EN TIEMPO REAL AL DOCENTE
function dibujarProgresoAlumnosParaDocente(usuarios) {
    const contenedorBarras = document.getElementById("lista-progreso-alumnos");
    if (!contenedorBarras) return;
    
    contenedorBarras.innerHTML = ""; 
    const alumnos = usuarios.filter(u => u.tipo === 'B');
    
    if (alumnos.length === 0) {
        contenedorBarras.innerHTML = "<p style='color: #64748b;'>No hay alumnos registrados todavía.</p>";
        return;
    }
    
    alumnos.forEach(alumno => {
        const pegadas = (alumno.album ? alumno.album.filter(f => f !== "").length : 0);
        const totalFiguras = 20; 
        const porcentaje = Math.round((pegadas / totalFiguras) * 100) || 0;
        const puntos = alumno.puntos || 0;

        const filaHTML = `
            <div class="alumno-progreso-item" style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #e2e8f0;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.95rem; margin-bottom: 5px;">
                    <span>👤 ${alumno.usuario} <small style="color: #64748b; font-weight:normal;">(Puntos ganados: ⭐ ${puntos})</small></span>
                    <span style="color: #2563eb;">${porcentaje}% (${pegadas}/${totalFiguras})</span>
                </div>
                <div class="barra-fondo-colegial" style="background: #e2e8f0; border: 2px solid #000; border-radius: 20px; height: 18px; overflow: hidden; position: relative;">
                    <div class="barra-llenado-animada" style="width: ${porcentaje}%; background: #22c55e; height: 100%; transition: width 0.4s ease-in-out;"></div>
                </div>
            </div>
        `;
        contenedorBarras.insertAdjacentHTML('beforeend', filaHTML);
    });
}

// REGISTRO DE USUARIOS
if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', function(evento) {
        evento.preventDefault();
        
        const nuevoNombre = document.getElementById('reg-username').value.trim();
        const nuevaContrasena = document.getElementById('reg-password').value;
        const tipoSeleccionado = document.getElementById('reg-type').value;
        
        const usuarioExiste = listaUsuariosGlobal.some(u => u.usuario.toLowerCase() === nuevoNombre.toLowerCase());
        
        if (usuarioExiste) {
            mensajeAuth.style.color = '#ef4444';
            mensajeAuth.textContent = 'El nombre de usuario ya está registrado.';
            return;
        }
        
        const nuevoUsuario = {
            usuario: nuevoNombre,
            contrasena: nuevaContrasena,
            tipo: tipoSeleccionado,
            permitido: false, 
            bloqueado: false,
            puntos: 0,
            mensajes: [""], 
            inventario: [""], 
            album: [""]       
        };
        
        listaUsuariosGlobal.push(nuevoUsuario);
        guardarUsuariosEnNube(listaUsuariosGlobal);
        
        mensajeAuth.style.color = '#10b981';
        mensajeAuth.textContent = '¡Registro exitoso! Espera a que el administrador apruebe tu cuenta.';
        formularioRegistro.reset();
    });
}

// INICIO DE SESIÓN
if (formularioLogin) {
    formularioLogin.addEventListener('submit', function(evento) {
        evento.preventDefault();
        
        const nombreInput = document.getElementById('login-username').value.trim();
        const contrasenaInput = document.getElementById('login-password').value;
        
        const usuarioEncontrado = listaUsuariosGlobal.find(u => u.usuario === nombreInput && u.contrasena === contrasenaInput);
        
        if (!usuarioEncontrado) {
            mensajeAuth.style.color = '#ef4444';
            mensajeAuth.textContent = 'Usuario o contraseña incorrectos.';
            return;
        }
        
        if (usuarioEncontrado.bloqueado) {
            mensajeAuth.style.color = '#ef4444';
            mensajeAuth.textContent = 'Tu cuenta ha sido bloqueada.';
            return;
        }
        
        if (!usuarioEncontrado.permitido && usuarioEncontrado.tipo !== 'ADMIN') {
            mensajeAuth.style.color = '#f59e0b'; 
            mensajeAuth.textContent = 'Tu registro está pendiente de aprobación.';
            return;
        }
        
        usuarioActual = usuarioEncontrado;
        mensajeAuth.textContent = ''; 
        formularioLogin.reset();
        
        localStorage.setItem(CLAVE_SESION_PESTANA, usuarioActual.usuario);
        cargarPantallaUsuario(usuarioActual);
        
        // Encendemos la sincronización asíncrona tras loguearse manualmente
        activarSincronizacionEnVivo();
    });
}

// ROUTER Y NAVEGACIÓN DE PANTALLAS
function cargarPantallaUsuario(usuario) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.body.classList.remove('user-type-a', 'user-type-b');
    
    if (usuario.tipo === 'ADMIN') {
        document.getElementById('admin-screen').classList.remove('hidden');
        if (typeof window.actualizarPanelAdmin === 'function') window.actualizarPanelAdmin(); 
    } 
    else if (usuario.tipo === 'A') {
        document.getElementById('userA-screen').classList.remove('hidden');
        document.getElementById('username-display-A').textContent = usuario.usuario;
        document.body.classList.add('user-type-a'); 
        actualizarPantallaSegunDatos(); 
    } 
    else if (usuario.tipo === 'B') {
        document.getElementById('userB-screen').classList.remove('hidden');
        document.getElementById('username-display-B').textContent = usuario.usuario;
        document.body.classList.add('user-type-b'); 
        actualizarPantallaSegunDatos(); 
    }
}

function actualizarPantallaSegunDatos() {
    if (!usuarioActual) return;
    if (usuarioActual.tipo === 'A') {
        mostrarMensajesAdmin('userA-notifications');
        if (typeof window.actualizarInventarioA === 'function') window.actualizarInventarioA();
        if (typeof window.actualizarSelectUsuariosB === 'function') window.actualizarSelectUsuariosB();
    } else if (usuarioActual.tipo === 'B') {
        mostrarMensajesAdmin('userB-notifications');
        if (typeof window.actualizarInventarioB === 'function') window.actualizarInventarioB();
        if (typeof window.dibujarAlbumCuaderno === 'function') window.dibujarAlbumCuaderno();
        if (typeof window.actualizarSelectAlumnosB === 'function') window.actualizarSelectAlumnosB();
    }
}

document.querySelectorAll('.logout-btn').forEach(boton => {
    boton.addEventListener('click', () => forzarCierreSesion(''));
});

function forzarCierreSesion(mensaje) {
    usuarioActual = null;
    localStorage.removeItem(CLAVE_SESION_PESTANA);
    document.body.classList.remove('user-type-a', 'user-type-b');
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    if (pantallaAuth) pantallaAuth.classList.remove('hidden');
    if (mensajeAuth) {
        if (mensaje) {
            mensajeAuth.style.color = '#ef4444';
            mensajeAuth.textContent = mensaje;
        } else {
            mensajeAuth.textContent = '';
        }
    }
    // Desvinculamos escuchadores globales si se sale del sistema
    db.ref('usuarios').off();
}

function mostrarMensajesAdmin(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    contenedor.innerHTML = '';
    if (usuarioActual && usuarioActual.mensajes) {
        usuarioActual.mensajes.forEach(msg => {
            if (msg === "") return;
            const alerta = document.createElement('div');
            alerta.className = 'alert-box warning';
            alerta.textContent = `⚠️ Alerta: ${msg}`;
            contenedor.appendChild(alerta);
        });
    }
}
// ========================================================
// 💾 FUNCIÓN PARA GUARDAR LOS DATOS DIRECTO EN FIREBASE
// ========================================================
function guardarUsuariosEnNube(nuevaLista) {
    db.ref('usuarios').set(nuevaLista)
        .then(() => {
            console.log("¡Datos sincronizados en Firebase con éxito!");
        })
        .catch((error) => {
            console.error("Error al guardar en Firebase:", error);
            if (mensajeAuth) {
                mensajeAuth.style.color = '#ef4444';
                mensajeAuth.textContent = 'Hubo un problema de conexión con la base de datos.';
            }
        });
}
// 🔥 DISPARO DE INICIO AUTOMÁTICO
inicializarPersistenciaF5();
