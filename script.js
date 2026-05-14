(() => {
    'use strict';

    const $ = (sel) => document.querySelector(sel);
    const form     = $('#loginForm');
    const email    = $('#email');
    const senha    = $('#senha');
    const toggle   = $('#togglePass');
    const submit   = $('#submitBtn');
    const greeting = $('#greeting');
    const emailField = email.closest('.field');
    const senhaField = senha.closest('.field');

    /* Saudação contextual por horário ---------------------------- */
    const h = new Date().getHours();
    const saudacao =
        h < 5  ? 'Boa madrugada' :
        h < 12 ? 'Bom dia'       :
        h < 18 ? 'Boa tarde'     :
                 'Boa noite';
    greeting.textContent = saudacao;

    /* Mostrar / ocultar senha ------------------------------------ */
    toggle.addEventListener('click', () => {
        const visivel = senha.type === 'text';
        senha.type = visivel ? 'password' : 'text';
        toggle.setAttribute('aria-pressed', String(!visivel));
        toggle.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');
        senha.focus();
    });

    /* Indicador de e-mail com formato válido --------------------- */
    const formatoValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    email.addEventListener('input', () => {
        emailField.classList.toggle('is-valid', formatoValido(email.value));
    });

    /* Aviso de Caps Lock ----------------------------------------- */
    const onKey = (e) => {
        if (typeof e.getModifierState !== 'function') return;
        senhaField.classList.toggle('caps-on', e.getModifierState('CapsLock'));
    };
    senha.addEventListener('keydown', onKey);
    senha.addEventListener('keyup', onKey);
    senha.addEventListener('blur', () => senhaField.classList.remove('caps-on'));

    /* Estado de envio -------------------------------------------- */
    form.addEventListener('submit', () => {
        submit.classList.add('is-loading');
        submit.disabled = true;
    });

    /* Parallax sutil da aurora seguindo o mouse ------------------ */
    const reduzMov = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ponteiroFino = matchMedia('(pointer: fine)').matches;

    if (!reduzMov && ponteiroFino) {
        const aurora = document.querySelector('.aurora');
        let raf = 0;
        document.addEventListener('mousemove', (e) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                const x = (e.clientX / innerWidth  - 0.5) * 14;
                const y = (e.clientY / innerHeight - 0.5) * 14;
                aurora.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                raf = 0;
            });
        }, { passive: true });
    }
})();
