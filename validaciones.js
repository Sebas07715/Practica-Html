/**
 * validaciones.js
 * Lógica de validación del formulario de registro para GlobalImport S.A.
 * Utiliza JavaScript Vanilla, sin librerías externas.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.register-form');
    
    // ==========================================
    // DINAMISMO EN TIEMPO REAL: CONTADOR TEXTAREA
    // ==========================================
    const referenciasTextarea = document.getElementById('referencias');
    
    // Crear el elemento visual para el contador
    const contadorCaracteres = document.createElement('div');
    contadorCaracteres.style.fontSize = '0.8rem';
    contadorCaracteres.style.color = 'var(--color-texto-suave)';
    contadorCaracteres.style.marginTop = '6px';
    contadorCaracteres.textContent = '200 caracteres restantes';
    
    // Insertar el contador justo debajo del textarea
    referenciasTextarea.parentNode.insertBefore(contadorCaracteres, referenciasTextarea.nextSibling);

    // Escuchar el evento 'input' para actualizar el conteo a medida que se escribe
    referenciasTextarea.addEventListener('input', () => {
        const longitudActual = referenciasTextarea.value.length;
        const maxCaracteres = 200;
        const restantes = maxCaracteres - longitudActual;
        
        contadorCaracteres.textContent = `${restantes} caracteres restantes`;
        
        // UX opcional: Cambiar a rojo si llega a 0
        if (restantes === 0) {
            contadorCaracteres.style.color = 'var(--color-error)';
        } else {
            contadorCaracteres.style.color = 'var(--color-texto-suave)';
        }
    });


    // ==========================================
    // RETROALIMENTACIÓN VISUAL (UX EN TIEMPO REAL)
    // ==========================================
    // Obtener todos los campos de entrada del formulario
    const formElements = form.querySelectorAll('input, select, textarea');
    
    // Función para limpiar errores en el momento que el usuario corrige
    formElements.forEach(element => {
        const removeError = function() {
            this.classList.remove('input-error');
        };
        
        element.addEventListener('input', removeError);
        element.addEventListener('change', removeError);
    });


    // ==========================================
    // FUNCIONES AUXILIARES DE VALIDACIÓN
    // ==========================================
    
    // Algoritmo de Módulo 11 para RUT Chileno
    const esRutValido = (rut) => {
        // Eliminar caracteres que no sean números o 'K', convertir a mayúsculas
        const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
        
        // Validar que la longitud sea entre 8 y 9 (Cuerpo de 7-8 + DV de 1)
        if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;

        // Separar cuerpo (número) y dígito verificador (dv)
        const cuerpo = rutLimpio.slice(0, -1);
        const dv = rutLimpio.slice(-1);

        // Si el cuerpo no contiene solo números, es inválido
        if (!/^\d+$/.test(cuerpo)) return false;

        let suma = 0;
        let multiplo = 2;

        // Aplicación del algoritmo
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
            multiplo = multiplo < 7 ? multiplo + 1 : 2;
        }

        const dvEsperado = 11 - (suma % 11);
        const dvCalculado = dvEsperado === 11 ? '0' : (dvEsperado === 10 ? 'K' : dvEsperado.toString());

        return dv === dvCalculado;
    };

    // Cálculo de mayoría de edad (18 años)
    const esMayorDeEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return false;
        
        const fechaNac = new Date(fechaNacimiento);
        const hoy = new Date(); // Fecha actual del sistema (en el contexto: año 2026)
        
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const diferenciaMes = hoy.getMonth() - fechaNac.getMonth();
        
        // Ajustar si aún no ha cumplido años en el año actual
        if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        
        return edad >= 18;
    };


    // ==========================================
    // MANEJO DEL EVENTO SUBMIT PRINCIPAL
    // ==========================================
    form.addEventListener('submit', (e) => {
        // 1. Congelar el envío del formulario para procesar en cliente
        e.preventDefault();
        
        let isValid = true; // Bandera de estado global del formulario

        // Función rápida para marcar fallos visualmente y registrar el error
        const marcarError = (elemento) => {
            if (elemento) {
                elemento.classList.add('input-error');
                isValid = false;
            }
        };

        // --- SECCIÓN A: DATOS PERSONALES ---
        const nombreInput = document.getElementById('nombre');
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,60}$/;
        if (!regexNombre.test(nombreInput.value.trim())) marcarError(nombreInput);

        const nacimientoInput = document.getElementById('nacimiento');
        if (!esMayorDeEdad(nacimientoInput.value)) marcarError(nacimientoInput);

        const rutInput = document.getElementById('rut');
        if (!esRutValido(rutInput.value)) marcarError(rutInput);

        const generoInput = document.getElementById('genero');
        if (!generoInput.value) marcarError(generoInput); // Si no se ha elegido opción

        const nacionalidadInput = document.getElementById('nacionalidad');
        if (!nacionalidadInput.value) marcarError(nacionalidadInput);


        // --- SECCIÓN B: CONTACTO Y ACCESO ---
        const emailInput = document.getElementById('email');
        const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; // RegEx estricta
        if (!regexEmail.test(emailInput.value.trim())) marcarError(emailInput);

        const confirmEmailInput = document.getElementById('confirm-email');
        if (confirmEmailInput.value.trim() !== emailInput.value.trim() || confirmEmailInput.value === '') {
            marcarError(confirmEmailInput);
        }

        const passwordInput = document.getElementById('password');
        // RegEx Contraseña: Min 8 chars, 1 mayúscula, 1 número, 1 carácter especial
        const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
        if (!regexPassword.test(passwordInput.value)) marcarError(passwordInput);

        const confirmPasswordInput = document.getElementById('confirm-password');
        if (confirmPasswordInput.value !== passwordInput.value || confirmPasswordInput.value === '') {
            marcarError(confirmPasswordInput);
        }

        const telefonoInput = document.getElementById('telefono');
        const regexTelefonoFormato = /^[\d\s+-]+$/;
        const digitosTelefono = telefonoInput.value.replace(/[^\d]/g, '').length;
        if (!regexTelefonoFormato.test(telefonoInput.value.trim()) || digitosTelefono < 8) {
            marcarError(telefonoInput);
        }


        // --- SECCIÓN C: DIRECCIÓN DE ENTREGA ---
        const paisEntregaInput = document.getElementById('pais-entrega');
        if (!paisEntregaInput.value) marcarError(paisEntregaInput);

        const provinciaInput = document.getElementById('provencia');
        if (provinciaInput.value.trim() === '') marcarError(provinciaInput);

        const ciudadInput = document.getElementById('ciudad');
        const regexCiudad = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
        if (!regexCiudad.test(ciudadInput.value.trim())) marcarError(ciudadInput);

        const calleInput = document.getElementById('calle');
        if (calleInput.value.trim().length < 5) marcarError(calleInput);

        const codigoPostalInput = document.getElementById('codigo-postal');
        const regexPostal = /^[a-zA-Z0-9]{4,10}$/;
        if (!regexPostal.test(codigoPostalInput.value.trim())) marcarError(codigoPostalInput);

        if (referenciasTextarea.value.length > 200) marcarError(referenciasTextarea);


        // --- SECCIÓN D: PREFERENCIAS Y TÉRMINOS ---
        const interesesSeleccionados = document.querySelectorAll('input[name="intereses"]:checked');
        if (interesesSeleccionados.length === 0) {
            // Marcamos todos los checkboxes del grupo si falla
            document.querySelectorAll('input[name="intereses"]').forEach(cb => marcarError(cb));
        }

        ['terminos', 'privacidad'].forEach(nombreFiltro => {
            const checkboxObligatorio = document.querySelector(`input[name="${nombreFiltro}"]`);
            if (!checkboxObligatorio.checked) marcarError(checkboxObligatorio);
        });

        // --- DECISIÓN FINAL ---
        if (isValid) {
            alert('¡Formulario validado con éxito! Todos los datos son correctos. Procediendo con el registro...');
            // form.submit(); <-- En un entorno real de producción se descomenta esta línea para enviar al backend
        } else {
            // UX Adicional (No intrusiva)
            console.warn('Fallo de validación. Verifica los campos marcados en rojo.');
        }
    });
});