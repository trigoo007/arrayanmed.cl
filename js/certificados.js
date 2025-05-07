document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar Supabase
    await loadSupabase();
    
    // Establecer la fecha actual como valor predeterminado para el campo de fecha de emisión
    const fechaEmisionInput = document.getElementById('fechaEmision');
    if (fechaEmisionInput) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        fechaEmisionInput.value = formattedDate;
    }
    
    // Referencia al formulario de certificados
    const certificadoForm = document.getElementById('certificadoForm');
    const previewBtn = document.getElementById('previewBtn');
    const editBtn = document.getElementById('editBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const previewContainer = document.getElementById('previewContainer');
    const certificadoPreview = document.getElementById('certificadoPreview');
    
    // Referencia a campos específicos
    const tipoCertificado = document.getElementById('tipoCertificado');
    const campoReposo = document.getElementById('campoReposo');
    const campoFechaInicio = document.getElementById('campoFechaInicio');
    const campoFechaFin = document.getElementById('campoFechaFin');
    
    // Mostrar/ocultar campos según el tipo de certificado seleccionado
    if (tipoCertificado) {
        tipoCertificado.addEventListener('change', function() {
            updateFieldsVisibility();
        });
    }
    
    // Función para actualizar la visibilidad de los campos según el tipo de certificado
    function updateFieldsVisibility() {
        const selectedType = tipoCertificado.value;
        
        // Ocultar todos los campos condicionales
        campoReposo.classList.add('hidden');
        campoFechaInicio.classList.add('hidden');
        campoFechaFin.classList.add('hidden');
        
        // Mostrar campos según el tipo de certificado
        if (selectedType === 'Reposo') {
            campoReposo.classList.remove('hidden');
            campoFechaInicio.classList.remove('hidden');
            campoFechaFin.classList.remove('hidden');
        } else if (selectedType === 'Tratamiento' || selectedType === 'Escolar') {
            campoFechaInicio.classList.remove('hidden');
            campoFechaFin.classList.remove('hidden');
        }
    }
    
    // Botón de vista previa
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            // Validar que los campos obligatorios estén llenos
            if (!validateForm(certificadoForm)) {
                alert('Por favor complete todos los campos obligatorios.');
                return;
            }
            
            // Generar vista previa
            generateCertificadoPreview();
            
            // Mostrar el contenedor de vista previa
            certificadoForm.style.display = 'none';
            previewContainer.style.display = 'block';
        });
    }
    
    // Botón de editar
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            certificadoForm.style.display = 'block';
            previewContainer.style.display = 'none';
        });
    }
    
    // Botón de descargar PDF
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            generatePDF();
        });
    }
    
    // Formulario de certificado
    if (certificadoForm) {
        certificadoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar que los campos obligatorios estén llenos
            if (!validateForm(certificadoForm)) {
                alert('Por favor complete todos los campos obligatorios.');
                return;
            }
            
            // Generar vista previa si no está visible
            if (previewContainer.style.display !== 'block') {
                generateCertificadoPreview();
                certificadoForm.style.display = 'none';
                previewContainer.style.display = 'block';
            }
            
            // Guardar en Supabase
            await saveCertificadoToSupabase();
            
            // Generar PDF
            generatePDF();
        });
    }
    
    // Función para validar el formulario
    function validateForm(form) {
        const requiredInputs = form.querySelectorAll('[required]');
        let valid = true;
        
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                valid = false;
            } else {
                input.classList.remove('error');
            }
        });
        
        // Validar campos adicionales según el tipo de certificado
        const selectedType = tipoCertificado.value;
        if (selectedType === 'Reposo') {
            const diasReposo = document.getElementById('diasReposo');
            if (!diasReposo.value) {
                diasReposo.classList.add('error');
                valid = false;
            }
        }
        
        return valid;
    }
    
    // Función para guardar el certificado en Supabase
    async function saveCertificadoToSupabase() {
        try {
            const patientName = document.getElementById('patientName').value;
            const diagnostico = document.getElementById('diagnostico').value;
            const descripcion = document.getElementById('descripcion').value;
            const fechaEmision = document.getElementById('fechaEmision').value;
            
            // Obtener el ID del usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                console.error('Usuario no autenticado');
                return;
            }
            
            // Crear el certificado en Supabase
            const { data, error } = await supabase
                .from('arrayanmed.certificados')
                .insert([
                    {
                        usuario_id: user.id,
                        paciente: patientName,
                        diagnostico: diagnostico,
                        recomendaciones: descripcion,
                        fecha_emision: new Date(fechaEmision).toISOString()
                    }
                ]);
            
            if (error) {
                console.error('Error al guardar certificado:', error);
                alert('Error al guardar el certificado en la base de datos.');
            } else {
                console.log('Certificado guardado correctamente:', data);
            }
        } catch (error) {
            console.error('Error al guardar certificado:', error);
            alert('Error al guardar el certificado en la base de datos.');
        }
    }
    
    // Función para generar la vista previa del certificado
    function generateCertificadoPreview() {
        // Obtener datos del formulario
        const patientName = document.getElementById('patientName').value;
        const patientRut = document.getElementById('patientRut').value;
        const patientAge = document.getElementById('patientAge').value;
        const patientGender = document.getElementById('patientGender').value;
        const tipoCert = document.getElementById('tipoCertificado').value;
        const diagnostico = document.getElementById('diagnostico').value;
        const descripcion = document.getElementById('descripcion').value;
        const fechaEmision = document.getElementById('fechaEmision').value;
        
        // Obtener datos específicos según el tipo de certificado
        let diasReposo = '';
        let fechaInicio = '';
        let fechaFin = '';
        
        if (tipoCert === 'Reposo') {
            diasReposo = document.getElementById('diasReposo').value;
            fechaInicio = document.getElementById('fechaInicio').value;
            fechaFin = document.getElementById('fechaFin').value;
        } else if (tipoCert === 'Tratamiento' || tipoCert === 'Escolar') {
            fechaInicio = document.getElementById('fechaInicio').value;
            fechaFin = document.getElementById('fechaFin').value;
        }
        
        // Obtener datos del usuario actual
        const userEmail = document.getElementById('userEmail').textContent;
        
        // Formatear fechas
        const formattedEmisionDate = formatDate(fechaEmision);
        const formattedInicioDate = formatDate(fechaInicio);
        const formattedFinDate = formatDate(fechaFin);
        
        // Determinar el título del certificado
        let certificadoTitulo = '';
        switch (tipoCert) {
            case 'Reposo':
                certificadoTitulo = 'CERTIFICADO DE REPOSO MÉDICO';
                break;
            case 'Escolar':
                certificadoTitulo = 'CERTIFICADO MÉDICO ESCOLAR';
                break;
            case 'Condicion':
                certificadoTitulo = 'CERTIFICADO DE CONDICIÓN MÉDICA';
                break;
            case 'Tratamiento':
                certificadoTitulo = 'CERTIFICADO DE TRATAMIENTO MÉDICO';
                break;
            case 'Asistencia':
                certificadoTitulo = 'CERTIFICADO DE ASISTENCIA MÉDICA';
                break;
            default:
                certificadoTitulo = 'CERTIFICADO MÉDICO';
        }
        
        // Crear contenido específico según el tipo de certificado
        let contenidoEspecifico = '';
        
        if (tipoCert === 'Reposo') {
            contenidoEspecifico = `
                <p>Certifico que el/la paciente debe guardar reposo médico por un período de <strong>${diasReposo} días</strong>, 
                desde el <strong>${formattedInicioDate}</strong> hasta el <strong>${formattedFinDate}</strong>, 
                debido a su condición de salud actual.</p>
            `;
        } else if (tipoCert === 'Tratamiento') {
            contenidoEspecifico = `
                <p>Certifico que el/la paciente se encuentra en tratamiento médico en este centro desde el 
                <strong>${formattedInicioDate}</strong> hasta el <strong>${formattedFinDate}</strong>.</p>
            `;
        } else if (tipoCert === 'Escolar') {
            contenidoEspecifico = `
                <p>Certifico que por razones de salud, el/la paciente debe tener las siguientes consideraciones
                en el ámbito escolar durante el período comprendido entre el <strong>${formattedInicioDate}</strong>
                y el <strong>${formattedFinDate}</strong>.</p>
            `;
        }
        
        // Crear HTML para la vista previa
        const certificadoHTML = `
            <div class="document-preview">
                <div class="document-header">
                    <img src="../img/logo.svg" alt="Logo Centro Médico Infantil Arrayán" class="document-logo">
                    <div class="document-title">Centro Médico Infantil Arrayán</div>
                    <div class="document-subtitle">Especialistas en Salud Mental Infantil</div>
                    <div>R.U.T: XX.XXX.XXX-X</div>
                </div>
                
                <div class="document-content">
                    <div class="document-title text-center">${certificadoTitulo}</div>
                    
                    <div class="patient-info mt-20">
                        <p><strong>Paciente:</strong> ${patientName}</p>
                        <p><strong>RUT:</strong> ${patientRut}</p>
                        <p><strong>Edad:</strong> ${patientAge} años</p>
                        <p><strong>Género:</strong> ${patientGender}</p>
                    </div>
                    
                    <div class="document-body mt-20">
                        <p>Quien suscribe, médico psiquiatra infantil de Centro Médico Infantil Arrayán, certifica que:</p>
                        
                        ${contenidoEspecifico}
                        
                        ${diagnostico ? `<p><strong>Diagnóstico:</strong> ${diagnostico}</p>` : ''}
                        
                        <p>${descripcion}</p>
                        
                        <p class="mt-20">Se extiende el presente certificado a petición del interesado y para los fines que estime conveniente.</p>
                        
                        <p class="text-center mt-20">Santiago, ${formattedEmisionDate}</p>
                    </div>
                </div>
                
                <div class="document-footer">
                    <div class="doctor-signature"></div>
                    <div class="doctor-info">
                        <p>Dr(a). ${getUserName(userEmail)}</p>
                        <p>Psiquiatra Infantil</p>
                        <p>Centro Médico Infantil Arrayán</p>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar HTML en el contenedor de vista previa
        certificadoPreview.innerHTML = certificadoHTML;
    }
    
    // Función para generar PDF
    function generatePDF() {
        const element = document.getElementById('certificadoPreview');
        const patientName = document.getElementById('patientName').value;
        const tipoCert = document.getElementById('tipoCertificado').value;
        const fechaEmision = document.getElementById('fechaEmision').value;
        const formattedDate = formatDateForFilename(fechaEmision);
        
        const filename = `Certificado_${tipoCert}_${patientName.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
        
        const opt = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Usar html2pdf para generar y descargar el PDF
        html2pdf().set(opt).from(element).save();
    }
    
    // Función para formatear la fecha (para mostrar)
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const day = date.getDate();
        const month = getMonthName(date.getMonth());
        const year = date.getFullYear();
        
        return `${day} de ${month} de ${year}`;
    }
    
    // Función para formatear la fecha (para nombre de archivo)
    function formatDateForFilename(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}-${month}-${year}`;
    }
    
    // Función para obtener el nombre del mes
    function getMonthName(monthIndex) {
        const months = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        
        return months[monthIndex];
    }
    
    // Función para obtener el nombre del médico a partir del email
    function getUserName(email) {
        // Esta función debería obtener el nombre del médico desde una base de datos
        // Como es un ejemplo, extraeremos el nombre del correo electrónico
        
        if (!email) return 'Médico';
        
        // Extraer la parte del nombre del correo (antes del @)
        const namePart = email.split('@')[0];
        
        // Convertir formato (por ejemplo, "juan.perez" a "Juan Perez")
        const nameParts = namePart.split('.');
        const formattedParts = nameParts.map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
        );
        
        return formattedParts.join(' ');
    }
    
    // Función para cargar Supabase
    async function loadSupabase() {
        // Cargar el script de Supabase si no está cargado
        if (typeof supabase === 'undefined') {
            // Cargar la biblioteca de Supabase
            const supabaseScript = document.createElement('script');
            supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            document.head.appendChild(supabaseScript);
            
            // Esperar a que la biblioteca se cargue
            await new Promise(resolve => {
                supabaseScript.onload = resolve;
            });
            
            // Esperar a que la configuración de Supabase esté disponible
            if (typeof getSupabase === 'function') {
                supabase = getSupabase();
            } else {
                // Si getSupabase no está disponible, crear directamente el cliente
                console.warn('getSupabase no está disponible, creando cliente directamente');
                supabase = supabaseClient.createClient(
                    'https://aigcgrcfbzzfsszrbsid.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZ2NncmNmYnp6ZnNzenJic2lkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIyNDgwMSwiZXhwIjoyMDYxODAwODAxfQ.QyitPa8rd4obmWFEukRacz6DUIeCEvQBAY2Ijv7ahBI'
                );
            }
        }
    }
    
    // Inicializar la visibilidad de los campos
    updateFieldsVisibility();
});