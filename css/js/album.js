// ========================================================
// USUARIO TIPO B (ALUMNO) - ÁLBUM INTERACTIVO Y CANJES
// ========================================================

let paginaActualLibro = 1;
const FIGURAS_POR_PAGINA = 5;
let repetidasSeleccionadasInstancias = [];

window.actualizarInventarioB = function() {
    const contenedor = document.getElementById('received-figs-container');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    
    const invB = usuarioActual.inventario ? usuarioActual.inventario.filter(f => f !== "") : [];
    
    if (invB.length === 0) {
        contenedor.innerHTML = '<p style="color:#64748b;">No tienes figuras para pegar.</p>';
        return;
    }
    
    invB.forEach((fig, indice) => {
        const esHolografica = IDS_HOLOGRAFICOS.includes(fig.id);
        
        const card = document.createElement('div');
        card.className = `figura-sobre-item ${esHolografica ? 'figura-holografica' : ''}`;
        card.style.cssText = "background: white; border: 2px solid #000; border-radius: 10px; padding: 8px; text-align: center; box-shadow: 2px 2px 0px #000; display: flex; flex-direction: column; align-items: center; justify-content: space-between;";
        card.innerHTML = `
            <div class="shape ${fig.clase}"></div>
            <span style="font-weight: bold; font-size: 0.8rem; display: block; margin-bottom: 4px;">${fig.nombre}</span>
            <button onclick="pegarFiguraEnAlbum(${indice})" style="padding: 4px 8px; font-size: 0.75rem; font-family: inherit; font-weight: bold; border: 2px solid #000; border-radius: 6px; background: #4ade80; cursor: pointer; width: 100%;">Pegar</button>
        `;
        contenedor.appendChild(card);
    });
};

window.dibujarAlbumCuaderno = function() {
    const cuaderno = document.getElementById('album-notebook');
    if (!cuaderno) return;
    cuaderno.innerHTML = '';

    const contenedorRepetidas = document.getElementById('repeated-figs-container');
    if (contenedorRepetidas) contenedorRepetidas.innerHTML = '';

    const invB = usuarioActual.inventario ? usuarioActual.inventario.filter(f => f !== "") : [];
    const alb = usuarioActual.album ? usuarioActual.album : [];

    invB.forEach((fig) => {
        if (alb.includes(fig.id)) {
            const esHolografica = IDS_HOLOGRAFICOS.includes(fig.id);
            
            const miniCromo = document.createElement('div');
            miniCromo.className = `figura-repetida-mini ${esHolografica ? 'figura-holografica' : ''}`;
            
            if (repetidasSeleccionadasInstancias.includes(fig.instanciaId)) {
                miniCromo.classList.add('seleccionada-intercambio');
            }

            miniCromo.style.cssText = "background: white; border: 2px solid #000; border-radius: 8px; padding: 6px; text-align: center; box-shadow: 2px 2px 0px #000; display: flex; flex-direction: column; align-items: center; cursor:pointer;";
            miniCromo.innerHTML = `
                <div class="shape ${fig.clase}" style="transform: scale(0.7); margin-bottom: 2px;"></div>
                <span style="font-size: 0.75rem; font-weight: bold;">${fig.nombre}</span>
            `;
            
            miniCromo.addEventListener('click', function() {
                if (repetidasSeleccionadasInstancias.includes(fig.instanciaId)) {
                    repetidasSeleccionadasInstancias = repetidasSeleccionadasInstancias.filter(id => id !== fig.instanciaId);
                    miniCromo.classList.remove('seleccionada-intercambio');
                } else {
                    repetidasSeleccionadasInstancias.push(fig.instanciaId);
                    miniCromo.classList.add('seleccionada-intercambio');
                }
            });

            if (contenedorRepetidas) contenedorRepetidas.appendChild(miniCromo);
        }
    });

    const inicio = (paginaActualLibro - 1) * FIGURAS_POR_PAGINA;
    const fin = inicio + FIGURAS_POR_PAGINA;
    
    const figurasPaginaActual = BANCO_FIGURAS.slice(inicio, fin);
    
    figurasPaginaActual.forEach(figBase => {
        const yaPegada = alb.includes(figBase.id);
        const esHolografica = IDS_HOLOGRAFICOS.includes(figBase.id);
        
        const slot = document.createElement('div');
        slot.className = `album-slot ${yaPegada ? 'pegada' : ''} ${esHolografica ? 'figura-holografica' : ''}`;
        slot.setAttribute('data-id-figura', figBase.id); 

        if (yaPegada) {
            slot.innerHTML = `
                <div class="shape ${figBase.clase}"></div>
                <strong style="font-size: 0.85rem; color: #000; display: block; margin-top: 4px;">${figBase.nombre}</strong>
                <button class="btn-info-figura" onclick="verInfoFigura(${figBase.id})" style="margin-top: auto; display: block; font-size: 0.75rem; font-weight: bold; border: 2px solid #000; background: #3b82f6; color: white; border-radius: 6px; padding: 2px 6px; cursor: pointer;">🔍 Info</button>
            `;
        } else {
            slot.innerHTML = `
                <div class="shape ${figBase.clase}" style="opacity:0.15; filter:grayscale(1);"></div>
                <span style="font-size: 0.9rem; font-weight: 900; color: #64748b;">N° ${figBase.id}</span>
                <span style="font-size: 0.75rem; color: #94a3b8; display: block; font-weight: bold; margin-top: 2px;">
                    (${figBase.nombre})
                </span>
            `;
        }
        cuaderno.appendChild(slot);
    });

    const infoPag = document.getElementById('info-pagina');
    if (infoPag) {
        infoPag.textContent = `Página ${paginaActualLibro} de ${Math.ceil(BANCO_FIGURAS.length / FIGURAS_POR_PAGINA)}`;
    }

    const cantidadPegadas = alb.filter(id => typeof id === 'number' || id !== "").length;
    const totalFiguras = 20; 
    const porcentaje = Math.round((cantidadPegadas / totalFiguras) * 100);

    const barra = document.getElementById('barra-progreso-llena');
    const txtPorcentaje = document.getElementById('texto-porcentaje');
    const txtContador = document.getElementById('figuras-pegadas-contador');
    const marcadorPuntos = document.getElementById('mis-puntos-contador');

    if (barra) barra.style.width = `${porcentaje}%`;
    if (txtPorcentaje) txtPorcentaje.textContent = `${porcentaje}%`;
    if (txtContador) txtContador.textContent = cantidadPegadas;
    if (marcadorPuntos) marcadorPuntos.textContent = usuarioActual.puntos || 0;
};

window.cambiarPagina = function(direccion) {
    const totalPaginas = Math.ceil(BANCO_FIGURAS.length / FIGURAS_POR_PAGINA);
    paginaActualLibro += direccion;
    
    if (paginaActualLibro < 1) paginaActualLibro = 1;
    if (paginaActualLibro > totalPaginas) paginaActualLibro = totalPaginas;
    
    window.dibujarAlbumCuaderno();
};

window.verInfoFigura = function(idFigura) {
    const fig = BANCO_FIGURAS.find(f => f.id === idFigura);
    if (!fig) return;

    document.getElementById('modal-titulo-figura').textContent = fig.nombre;
    document.getElementById('modal-forma-preview').innerHTML = `<div class="shape ${fig.clase}"></div>`;
    
    const desc = fig.descripcion || `¡Excelente! El ${fig.nombre} es una pieza clave en tu cuaderno de geometría interactivo. ¡Sigue completando las páginas!`;
    document.getElementById('modal-texto-descripcion').textContent = desc;

    document.getElementById('modal-descripcion').classList.remove('hidden');
};

window.cerrarModalDesc = function() {
    document.getElementById('modal-descripcion').classList.add('hidden');
};

window.pegarFiguraEnAlbum = function(indiceInventarioReal) {
    const invB = usuarioActual.inventario.filter(f => f !== "");
    const figuraSeleccionada = invB[indiceInventarioReal];
    
    if (!figuraSeleccionada) return; 
    
    if (!usuarioActual.album) usuarioActual.album = [];
    const yaLaTiene = usuarioActual.album.includes(figuraSeleccionada.id);
    
    if (yaLaTiene) {
        alert('¡Ya tienes esta figura en tu álbum!');
        return;
    }    
    
    const indiceU = listaUsuariosGlobal.findIndex(u => u.usuario === usuarioActual.usuario);
    if (indiceU === -1) return;
    
    if(!listaUsuariosGlobal[indiceU].album || listaUsuariosGlobal[indiceU].album[0] === "") {
        listaUsuariosGlobal[indiceU].album = [];
    }

    const slotVisual = document.querySelector(`[data-id-figura="${figuraSeleccionada.id}"]`);
    if (slotVisual) {
        const esHolografica = IDS_HOLOGRAFICOS.includes(figuraSeleccionada.id);
        slotVisual.className = `album-slot pegada ${esHolografica ? 'figura-holografica' : ''}`;
        slotVisual.innerHTML = `
            <div class="shape ${figuraSeleccionada.clase}"></div>
            <strong style="font-size: 0.85rem; color: #000;">${figuraSeleccionada.nombre}</strong>
            <button class="btn-info-figura" onclick="verInfoFigura(${figuraSeleccionada.id})" style="margin-top: auto; display: block; font-size: 0.75rem; font-weight: bold; border: 2px solid #000; background: #3b82f6; color: white; border-radius: 6px; padding: 2px 6px; cursor: pointer;">🔍 Info</button>
        `;
    }
    
    setTimeout(() => {
        listaUsuariosGlobal[indiceU].album.push(figuraSeleccionada.id);
        
        invB.splice(indiceInventarioReal, 1);
        listaUsuariosGlobal[indiceU].inventario = invB.length === 0 ? [""] : invB;
        
        usuarioActual.album = listaUsuariosGlobal[indiceU].album;
        usuarioActual.inventario = listaUsuariosGlobal[indiceU].inventario;
        
        guardarUsuariosEnNube(listaUsuariosGlobal);
        
        window.dibujarAlbumCuaderno(); 
        window.actualizarInventarioB(); 
        
        comprobarAlbumCompleto();
    }, 300);
};

function comprobarAlbumCompleto() {
    const alb = usuarioActual.album ? usuarioActual.album.filter(a => a !== "") : [];
    if (alb.length === BANCO_FIGURAS.length) {
        setTimeout(() => alert('🎉 ¡ÁLBUM COMPLETADO EN LA NUBE! 🎉'), 400);
    }
}

window.actualizarSelectAlumnosB = function() {
    const select = document.getElementById('intercambio-target-user');
    if (!select) return;
    select.innerHTML = '<option value="">-- Seleccionar Compañero --</option>';
    
    listaUsuariosGlobal.forEach(u => {
        if (u.tipo === 'B' && u.permitido && u.usuario !== usuarioActual.usuario) {
            const opt = document.createElement('option');
            opt.value = u.usuario;
            opt.textContent = u.usuario;
            select.appendChild(opt);
        }
    });
};

window.ejecutarIntercambioB = function() {
    const compañeroDestino = document.getElementById('intercambio-target-user').value;
    if (!compañeroDestino) {
        alert('Por favor, selecciona a un compañero de clase.');
        return;
    }
    if (repetidasSeleccionadasInstancias.length === 0) {
        alert('Selecciona primero las figuras repetidas que deseas enviar haciendo clic sobre ellas.');
        return;
    }

    const indiceOrigen = listaUsuariosGlobal.findIndex(u => u.usuario === usuarioActual.usuario);
    const indiceDestino = listaUsuariosGlobal.findIndex(u => u.usuario === compañeroDestino);

    const invOrigen = listaUsuariosGlobal[indiceOrigen].inventario.filter(f => f !== "");
    const figurasAEnviar = invOrigen.filter(fig => repetidasSeleccionadasInstancias.includes(fig.instanciaId));

    listaUsuariosGlobal[indiceOrigen].inventario = invOrigen.filter(fig => !repetidasSeleccionadasInstancias.includes(fig.instanciaId));
    if(listaUsuariosGlobal[indiceOrigen].inventario.length === 0) listaUsuariosGlobal[indiceOrigen].inventario = [""];

    if (!listaUsuariosGlobal[indiceDestino].inventario || listaUsuariosGlobal[indiceDestino].inventario[0] === "") {
        listaUsuariosGlobal[indiceDestino].inventario = [];
    }
    listaUsuariosGlobal[indiceDestino].inventario.push(...figurasAEnviar);

    guardarUsuariosEnNube(listaUsuariosGlobal);
    alert(`¡Has enviado ${figurasAEnviar.length} figuras a ${compañeroDestino} con éxito! 🤝`);
    repetidasSeleccionadasInstancias = [];
};

window.ejecutarCanjePorPuntos = function() {
    if (repetidasSeleccionadasInstancias.length !== 5) {
        alert('Debes seleccionar exactamente 5 figuras repetidas para realizar el canje por puntos.');
        return;
    }

    const indiceU = listaUsuariosGlobal.findIndex(u => u.usuario === usuarioActual.usuario);
    if (indiceU === -1) return;

    const invU = listaUsuariosGlobal[indiceU].inventario.filter(f => f !== "");
    listaUsuariosGlobal[indiceU].inventario = invU.filter(fig => !repetidasSeleccionadasInstancias.includes(fig.instanciaId));
    
    if (listaUsuariosGlobal[indiceU].inventario.length === 0) {
        listaUsuariosGlobal[indiceU].inventario = [""];
    }

    const puntosActuales = listaUsuariosGlobal[indiceU].puntos || 0;
    listaUsuariosGlobal[indiceU].puntos = puntosActuales + 10;

    guardarUsuariosEnNube(listaUsuariosGlobal);
    alert('¡Has canjeado 5 figuras repetidas por +10 Puntos de Estrella! ⭐');
    repetidasSeleccionadasInstancias = [];
};