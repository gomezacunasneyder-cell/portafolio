// ---------- Año dinámico en el footer ----------
document.getElementById('year').textContent = new Date().getFullYear();

// El fondo de estrellas ahora vive 100% en styles.css (.stars-layer),
// así que el JS ya no necesita generar ni animar nada del fondo.

// ---------- Menú móvil ----------
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

// ---------- Resaltar enlace activo según la sección visible ----------
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        }
    });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(section => navObserver.observe(section));

// ---------- Scroll reveal ----------
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---------- Formulario de contacto ----------
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formStatus = document.getElementById('form-status');

// TODO: reemplaza esta dirección por tu correo real registrado en https://formsubmit.co
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/tu-correo@gmail.com';

function setError(fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    const errorEl = form.querySelector(`.error-msg[data-for="${fieldName}"]`);
    field.closest('.field').classList.toggle('invalid', Boolean(message));
    errorEl.textContent = message || '';
}

function validateForm() {
    let valid = true;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 2) {
        setError('name', 'Escribe tu nombre completo.');
        valid = false;
    } else {
        setError('name', '');
    }

    if (!emailPattern.test(email)) {
        setError('email', 'Ingresa un correo válido.');
        valid = false;
    } else {
        setError('email', '');
    }

    if (message.length < 10) {
        setError('message', 'Cuéntame un poco más (mínimo 10 caracteres).');
        valid = false;
    } else {
        setError('message', '');
    }

    return valid;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Campo trampa para bots: si viene lleno, se ignora el envío
    if (form._honey.value) return;

    if (!validateForm()) {
        formStatus.textContent = 'Revisa los campos marcados en rojo.';
        formStatus.className = 'form-status error';
        return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    try {
        const response = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: new FormData(form),
        });

        if (!response.ok) throw new Error('Respuesta no exitosa del servidor');

        formStatus.textContent = '¡Mensaje enviado! Te responderé pronto.';
        formStatus.className = 'form-status success';
        form.reset();
    } catch (err) {
        formStatus.textContent = 'No se pudo enviar. Escríbeme directo a mi correo mientras tanto.';
        formStatus.className = 'form-status error';
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});