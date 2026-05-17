let productos = JSON.parse(localStorage.getItem('productos_tiendita')) || [
];

let carrito = JSON.parse(localStorage.getItem('carrito_tiendita')) || [];
let imagenProductoTemporal = ""; 

function showSection(sectionId) {
    const sections = ['inicio-sec', 'catalogo-sec', 'carrito-sec', 'ubicacion-sec', 'contacto-sec'];
    sections.forEach(sec => {
        const el = document.getElementById(sec);
        if(el) el.style.display = 'none';
    });

    const activeSec = document.getElementById(`${sectionId}-sec`);
    if(activeSec) activeSec.style.display = 'block';

    const tabInicio = document.getElementById('tab-inicio');
    const tabCarrito = document.getElementById('tab-carrito');
    
    if(tabInicio && tabCarrito) {
        tabInicio.classList.remove('active');
        tabCarrito.classList.remove('active');
        if (sectionId === 'inicio' || sectionId === 'catalogo') tabInicio.classList.add('active');
        if (sectionId === 'carrito') tabCarrito.classList.add('active');
    }

    if(sectionId === 'catalogo') renderClienteCatalog();
    if(sectionId === 'carrito') renderCarrito();
}

function renderClienteCatalog() {
    const container = document.getElementById('catalog-container');
    if (!container) return;
    container.innerHTML = "";

    productos.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'card-info'; 
        card.innerHTML = `
            <img src="${prod.img}" alt="${prod.nombre}" style="width:100%; height:140px; object-fit:cover; border-radius:8px;">
            <h3>${prod.nombre}</h3>
            <p class="price">$${prod.precio}</p>
            <button class="add-btn" onclick="agregarAlCarrito(${prod.id})">Agregar 🛒</button>
        `;
        container.appendChild(card);
    });
}

function agregarAlCarrito(id) {
    const prod = productos.find(p => p.id === id);
    if(prod) {
        const existe = carrito.find(item => item.id === id);
        
        if(existe) {
            existe.cantidad = (parseInt(existe.cantidad) || 1) + 1;
        } else {
            carrito.push({ ...prod, cantidad: 1 });
        }
        
        localStorage.setItem('carrito_tiendita', JSON.stringify(carrito));
        alert(`${prod.nombre} añadido al pedido.`);
    }
}

function sumarCantidad(id) {
    const item = carrito.find(p => p.id === id);
    if(item) {
        item.cantidad = (parseInt(item.cantidad) || 1) + 1;
        localStorage.setItem('carrito_tiendita', JSON.stringify(carrito));
        renderCarrito();
    }
}

function restarCantidad(id) {
    const item = carrito.find(p => p.id === id);
    if(item) {
        item.cantidad = (parseInt(item.cantidad) || 1) - 1;
        
        if(item.cantidad <= 0) {
            carrito = carrito.filter(p => p.id !== id);
        }
        
        localStorage.setItem('carrito_tiendita', JSON.stringify(carrito));
        renderCarrito();
    }
}

function renderCarrito() {
    const container = document.getElementById('lista-carrito');
    const totalEl = document.getElementById('total-pedido');
    if(!container) return;

    container.innerHTML = "";
    let total = 0;

    if(carrito.length === 0) {
        container.innerHTML = "<p>Tu carrito está vacío.</p>";
        if(totalEl) totalEl.innerText = "0";
        return;
    }

    carrito.forEach((item) => {
        let cantidadSegura = parseInt(item.cantidad) || 1;
        let precioSeguro = parseFloat(item.precio) || 0;
        
        let subtotal = precioSeguro * cantidadSegura;
        total += subtotal;

        const row = document.createElement('div');
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.margin = "12px 0";
        row.style.padding = "8px 0";
        row.style.borderBottom = "1px dashed #eee"; 
        
        row.innerHTML = `
            <div style="display: flex; flex-direction: column; text-align: left;">
                <span style="font-weight: bold;">${item.nombre}</span>
                <span style="font-size: 13px; color: #777;">$${precioSeguro} c/u</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
                <button onclick="restarCantidad(${item.id})" style="background: #e74c3c; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">-</button>
                <span style="font-weight: bold; min-width: 20px; text-align: center;">${cantidadSegura}</span>
                <button onclick="sumarCantidad(${item.id})" style="background: #2ecc71; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                <span style="margin-left: 10px; font-weight: bold; color: #333;">$${subtotal}</span>
            </div>
        `;
        container.appendChild(row);
    });

    if(totalEl) totalEl.innerText = total;
}

function enviarPedido() {
    if(carrito.length === 0) return alert("El carrito está vacío");
    
    let mensaje = "¡Hola! Quisiera hacer el siguiente pedido:\n\n";
    let total = 0;
    
    carrito.forEach(item => {
        let cantidadSegura = parseInt(item.cantidad) || 1;
        let precioSeguro = parseFloat(item.precio) || 0;
        let subtotal = precioSeguro * cantidadSegura;
        
        mensaje += `• ${cantidadSegura}x ${item.nombre} ($${subtotal})\n`;
        total += subtotal;
    });
    
    mensaje += `\n*Total a pagar: $${total}*`;

    const telDinamico = localStorage.getItem('tiendita_whatsapp') || "524811237373";
    window.location.href = `https://wa.me/${telDinamico}?text=${encodeURIComponent(mensaje)}`;
}

function cargarConfiguracionesCliente() {
    const logo = localStorage.getItem('tiendita_logo') || "img/logo.jpeg";
    const tel = localStorage.getItem('tiendita_whatsapp') || "524811237373";

    const logoImg = document.getElementById('cliente-logo');
    if(logoImg) logoImg.src = logo;

    const txtTel = document.getElementById('text-contacto-tel');
    if(txtTel) txtTel.innerText = tel;

    const btnWa = document.getElementById('btn-wa-dinamico');
    if(btnWa) btnWa.onclick = () => window.location.href = `https://wa.me/${tel}`;

    const wrapperMapa = document.getElementById('wrapper-mapa');
    if(wrapperMapa) {
        const direccionGuardada = localStorage.getItem('tiendita_direccion') || "Ciudad Valles, S.L.P.";
        wrapperMapa.innerHTML = `
            <iframe 
                width="100%" 
                height="300" 
                style="border:0; border-radius:8px;" 
                loading="lazy" 
                allowfullscreen 
                src="https://maps.google.com/maps?q=${encodeURIComponent(direccionGuardada)}&t=&z=15&ie=UTF8&iwloc=&output=embed">
            </iframe>
        `;
    }
}


function renderAdminCatalog() {
    const container = document.getElementById('admin-catalog-container');
    if (!container) return;
    container.innerHTML = "";

    productos.forEach(prod => {
        const card = document.createElement('div');
        card.style.border = "1px solid #333";
        card.style.padding = "15px";
        card.style.borderRadius = "8px";
        card.style.background = "#111";
        card.innerHTML = `
            <img src="${prod.img}" alt="${prod.nombre}" style="width:100%; height:100px; object-fit:cover; border-radius:5px;">
            <h4 style="margin: 10px 0 5px 0; color: white;">${prod.nombre}</h4>
            <div style="margin-bottom:10px; color: white;">
                <span>$ </span>
                <input type="number" value="${prod.precio}" onchange="cambiarPrecio(${prod.id}, this.value)" style="width:70px; padding:4px; background:#222; color:white; border:1px solid #444;">
            </div>
            <button onclick="eliminarProducto(${prod.id})" style="background:#ff0055; color:white; border:none; padding:6px 12px; border-radius:5px; cursor:pointer; width:100%;">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        `;
        container.appendChild(card);
    });
}

function previsualizarFotoProducto(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagenProductoTemporal = e.target.result; 
            const preview = document.getElementById('preview-nuevo-producto');
            if (preview) {
                preview.src = imagenProductoTemporal;
                preview.style.display = "block"; 
            }
        };
        reader.readAsDataURL(file);
    }
}

function crearProductoNuevoAdmin() {
    const nombre = document.getElementById('admin-nombre').value;
    const precio = parseFloat(document.getElementById('admin-precio').value);
    const cat = document.getElementById('admin-cat').value;
    
    const img = imagenProductoTemporal || "img/logo.jpeg";

    if (!nombre || !precio || !cat) return alert("Llena los campos obligatorios");

    const nuevoProd = { id: Date.now(), nombre, precio, cat, img };
    productos.push(nuevoProd);
    
    localStorage.setItem('productos_tiendita', JSON.stringify(productos));
    
    document.getElementById('admin-nombre').value = "";
    document.getElementById('admin-precio').value = "";
    document.getElementById('admin-cat').value = "";
    document.getElementById('admin-img-galeria').value = "";
    
    const preview = document.getElementById('preview-nuevo-producto');
    if (preview) preview.style.display = "none";
    
    imagenProductoTemporal = ""; 
    
    renderAdminCatalog();
    alert("¡Producto añadido con su foto de galería! 🎉");
}

function cambiarPrecio(id, nuevoPrecio) {
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
        productos[index].precio = parseFloat(nuevoPrecio);
        localStorage.setItem('productos_tiendita', JSON.stringify(productos));
        renderAdminCatalog();
    }
}

function eliminarProducto(id) {
    if (confirm("¿Eliminar este producto?")) {
        productos = productos.filter(p => p.id !== id);
        localStorage.setItem('productos_tiendita', JSON.stringify(productos));
        renderAdminCatalog();
    }
}

function procesarLogoGaleria(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imagenBase64 = e.target.result;
            localStorage.setItem('tiendita_logo', imagenBase64);
            
            const preview = document.getElementById('admin-current-logo');
            if (preview) preview.src = imagenBase64;
            
            alert("¡Logo actualizado desde tu galería con éxito! 🎉");
        };
        reader.readAsDataURL(file);
    }
}

function actualizarContacto() {
    const tel = document.getElementById('input-contacto-tel').value;
    if (tel) {
        localStorage.setItem('tiendita_whatsapp', tel);
        alert("WhatsApp actualizado.");
    }
}

function actualizarDireccionMapa() {
    const direccion = document.getElementById('input-direccion-mapa').value;
    if (direccion) {
        localStorage.setItem('tiendita_direccion', direccion);
        alert("Ubicación de la tienda guardada.");
    } else {
        alert("Por favor escribe una dirección válida.");
    }
}