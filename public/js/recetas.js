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
    
    // Referencia al formulario de recetas
    const recetaForm = document.getElementById('recetaForm');
    const previewBtn = document.getElementById('previewBtn');
    const editBtn = document.getElementById('editBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const previewContainer = document.getElementById('previewContainer');
    const recetaPreview = document.getElementById('recetaPreview');
    
    // Botón de vista previa
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            // Validar que los campos obligatorios estén llenos
            if (!validateForm(recetaForm)) {
                alert('Por favor complete todos los campos obligatorios.');
                return;
            }
            
            // Generar vista previa
            generateRecetaPreview();
            
            // Mostrar el contenedor de vista previa
            recetaForm.style.display = 'none';
            previewContainer.style.display = 'block';
        });
    }
    
    // Botón de editar
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            recetaForm.style.display = 'block';
            previewContainer.style.display = 'none';
        });
    }
    
    // Botón de descargar PDF
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            generatePDF();
        });
    }
    
    // Formulario de receta
    if (recetaForm) {
        recetaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar que los campos obligatorios estén llenos
            if (!validateForm(recetaForm)) {
                alert('Por favor complete todos los campos obligatorios.');
                return;
            }
            
            // Generar vista previa si no está visible
            if (previewContainer.style.display !== 'block') {
                generateRecetaPreview();
                recetaForm.style.display = 'none';
                previewContainer.style.display = 'block';
            }
            
            // Guardar en Supabase
            await saveRecetaToSupabase();
            
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
        
        return valid;
    }
    
    // Función para guardar la receta en Supabase
    async function saveRecetaToSupabase() {
        try {
            const patientName = document.getElementById('patientName').value;
            const medicamento = document.getElementById('medicamento').value;
            const dosis = document.getElementById('dosis').value;
            const indicaciones = document.getElementById('indicaciones').value;
            const fechaEmision = document.getElementById('fechaEmision').value;
            
            // Calcular fecha de vencimiento (30 días después de emisión)
            const fechaEmisionObj = new Date(fechaEmision);
            const fechaVencimientoObj = new Date(fechaEmisionObj);
            fechaVencimientoObj.setDate(fechaVencimientoObj.getDate() + 30);
            const fechaVencimiento = fechaVencimientoObj.toISOString();
            
            // Obtener el ID del usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                console.error('Usuario no autenticado');
                return;
            }
            
            // Crear la receta en Supabase
            const { data, error } = await supabase
                .from('arrayanmed.recetas')
                .insert([
                    {
                        usuario_id: user.id,
                        paciente: patientName,
                        medicamento: medicamento,
                        dosis: dosis,
                        indicaciones: indicaciones,
                        fecha_emision: new Date(fechaEmision).toISOString(),
                        fecha_vencimiento: fechaVencimiento
                    }
                ]);
            
            if (error) {
                console.error('Error al guardar receta:', error);
                alert('Error al guardar la receta en la base de datos.');
            } else {
                console.log('Receta guardada correctamente:', data);
            }
        } catch (error) {
            console.error('Error al guardar receta:', error);
            alert('Error al guardar la receta en la base de datos.');
        }
    }
    
    // Función para generar la vista previa de la receta
    function generateRecetaPreview() {
        // Obtener datos del formulario
        const patientName = document.getElementById('patientName').value;
        const patientRut = document.getElementById('patientRut').value;
        const patientAge = document.getElementById('patientAge').value;
        const patientGender = document.getElementById('patientGender').value;
        const medicamento = document.getElementById('medicamento').value;
        const dosis = document.getElementById('dosis').value;
        const via = document.getElementById('via').value;
        const frecuencia = document.getElementById('frecuencia').value;
        const duracion = document.getElementById('duracion').value;
        const indicaciones = document.getElementById('indicaciones').value;
        const diagnostico = document.getElementById('diagnostico').value;
        const fechaEmision = document.getElementById('fechaEmision').value;
        
        // Obtener datos del usuario actual
        const userEmail = document.getElementById('userEmail').textContent;
        
        // Formatear la fecha
        const formattedDate = formatDate(fechaEmision);
        
        // Crear HTML para la vista previa
        const recetaHTML = `
            <div class="document-preview">
                <div class="document-header">
                    <img src="../img/logo.svg" alt="Logo Centro Médico Infantil Arrayán" class="document-logo">
                    <div class="document-title">Centro Médico Infantil Arrayán</div>
                    <div class="document-subtitle">Especialistas en Salud Mental Infantil</div>
                    <div>R.U.T: XX.XXX.XXX-X</div>
                </div>
                
                <div class="document-content">
                    <div class="document-title text-center">RECETA MÉDICA</div>
                    
                    <div class="patient-info mt-20">
                        <p><strong>Paciente:</strong> ${patientName}</p>
                        <p><strong>RUT:</strong> ${patientRut}</p>
                        <p><strong>Edad:</strong> ${patientAge} años</p>
                        <p><strong>Género:</strong> ${patientGender}</p>
                        <p><strong>Fecha:</strong> ${formattedDate}</p>
                    </div>
                    
                    <div class="medication-details">
                        <p><strong>Medicamento:</strong> ${medicamento}</p>
                        <p><strong>Dosis:</strong> ${dosis}</p>
                        <p><strong>Vía de administración:</strong> ${via}</p>
                        <p><strong>Frecuencia:</strong> ${frecuencia}</p>
                        <p><strong>Duración del tratamiento:</strong> ${duracion}</p>
                        ${indicaciones ? `<p><strong>Indicaciones adicionales:</strong> ${indicaciones}</p>` : ''}
                    </div>
                    
                    ${diagnostico ? `<p><strong>Diagnóstico:</strong> ${diagnostico}</p>` : ''}
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
        recetaPreview.innerHTML = recetaHTML;
    }
    
    // Función para generar PDF
    function generatePDF() {
        const element = document.getElementById('recetaPreview');
        const patientName = document.getElementById('patientName').value;
        const fechaEmision = document.getElementById('fechaEmision').value;
        const formattedDate = formatDate(fechaEmision, '-');
        
        const filename = `Receta_${patientName.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
        
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
    
    // Función para formatear la fecha
    function formatDate(dateString, separator = ' de ') {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const day = date.getDate();
        const month = getMonthName(date.getMonth());
        const year = date.getFullYear();
        
        return `${day}${separator}${month}${separator}${year}`;
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
});