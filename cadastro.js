(() => {
    'use strict';

    const $  = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const form      = $('#signupForm');
    const nome      = $('#nome');
    const email     = $('#email');
    const senha     = $('#senha');
    const confirmar = $('#confirmar');
    const termos    = $('#termos');
    const submit    = $('#submitBtn');
    const forca     = $('#forca');
    const forcaTxt  = forca.querySelector('.strength__label');
    const termsBox  = termos.closest('.terms');

    // Validação feita em JS; sem JS o navegador ainda usa a nativa.
    form.noValidate = true;

    /* Regras ---------------------------------------------------- */
    const formatoEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

    const regrasSenha = {
        len:  (v) => v.length >= 8,
        case: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
        num:  (v) => /\d/.test(v),
        sym:  (v) => /[^A-Za-z0-9]/.test(v),
    };

    const rotulosForca = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
    const dicaInicial  = forcaTxt.textContent;

    const validadores = {
        nome: () => {
            const v = nome.value.trim();
            if (!v) return 'Informe seu nome.';
            if (v.length < 3) return 'O nome precisa ter ao menos 3 caracteres.';
            return '';
        },
        email: () => {
            const v = email.value.trim();
            if (!v) return 'Informe seu e-mail.';
            if (!formatoEmail(v)) return 'Digite um e-mail válido, como nome@exemplo.com.';
            return '';
        },
        senha: () => {
            const v = senha.value;
            if (!v) return 'Crie uma senha.';
            if (!regrasSenha.len(v)) return 'A senha precisa ter ao menos 8 caracteres.';
            if (pontuacao(v) < 3) return 'Senha fraca: atenda a pelo menos 3 dos requisitos.';
            return '';
        },
        confirmar: () => {
            if (!confirmar.value) return 'Confirme sua senha.';
            if (confirmar.value !== senha.value) return 'As senhas não coincidem.';
            return '';
        },
    };

    const campos = { nome, email, senha, confirmar };

    /* Helpers de estado ----------------------------------------- */
    const setErro = (input, msg) => {
        const field = input.closest('.field');
        const erro  = field.querySelector('.field__error');
        field.classList.toggle('is-invalid', Boolean(msg));
        input.setAttribute('aria-invalid', String(Boolean(msg)));
        erro.textContent = msg;
    };

    const setValido = (input, ok) => {
        input.closest('.field').classList.toggle('is-valid', ok);
    };

    // Campo "tocado": só mostra erro depois que a pessoa saiu dele uma vez.
    const tocados = new Set();

    const validar = (chave) => {
        const msg = validadores[chave]();
        if (tocados.has(chave)) setErro(campos[chave], msg);
        return msg;
    };

    /* Força da senha -------------------------------------------- */
    const pontuacao = (v) =>
        Object.values(regrasSenha).reduce((n, fn) => n + (fn(v) ? 1 : 0), 0);

    const atualizaForca = () => {
        const v = senha.value;
        $$('.rules li').forEach((li) => {
            li.classList.toggle('is-met', regrasSenha[li.dataset.rule](v));
        });

        const nivel = v ? Math.max(1, pontuacao(v) - (regrasSenha.len(v) ? 0 : 1)) : 0;
        forca.dataset.level = String(nivel);
        forcaTxt.textContent = nivel ? `Força da senha: ${rotulosForca[nivel]}` : dicaInicial;
    };

    /* Eventos por campo ----------------------------------------- */
    Object.keys(campos).forEach((chave) => {
        const input = campos[chave];
        input.addEventListener('blur', () => {
            if (!input.value && !tocados.has(chave)) return;
            tocados.add(chave);
            validar(chave);
        });
    });

    nome.addEventListener('input', () => {
        setValido(nome, !validadores.nome());
        validar('nome');
    });

    email.addEventListener('input', () => {
        setValido(email, !validadores.email());
        validar('email');
    });

    const checaConfirmacao = () => {
        setValido(confirmar, Boolean(confirmar.value) && confirmar.value === senha.value);
        validar('confirmar');
    };

    senha.addEventListener('input', () => {
        atualizaForca();
        validar('senha');
        if (confirmar.value) checaConfirmacao();
    });

    confirmar.addEventListener('input', checaConfirmacao);

    termos.addEventListener('change', () => {
        if (termos.checked) setErroTermos('');
    });

    const setErroTermos = (msg) => {
        termsBox.classList.toggle('is-invalid', Boolean(msg));
        termsBox.querySelector('.field__error').textContent = msg;
    };

    /* Mostrar / ocultar senha ----------------------------------- */
    $$('[data-toggle]').forEach((btn) => {
        const alvo = document.getElementById(btn.dataset.toggle);
        btn.addEventListener('click', () => {
            const visivel = alvo.type === 'text';
            alvo.type = visivel ? 'password' : 'text';
            btn.setAttribute('aria-pressed', String(!visivel));
            btn.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');
            alvo.focus();
        });
    });

    /* Aviso de Caps Lock ---------------------------------------- */
    const senhaField = senha.closest('.field');
    const onKey = (e) => {
        if (typeof e.getModifierState !== 'function') return;
        senhaField.classList.toggle('caps-on', e.getModifierState('CapsLock'));
    };
    senha.addEventListener('keydown', onKey);
    senha.addEventListener('keyup', onKey);
    senha.addEventListener('blur', () => senhaField.classList.remove('caps-on'));

    /* Envio ----------------------------------------------------- */
    form.addEventListener('submit', (e) => {
        let primeiroInvalido = null;

        Object.keys(campos).forEach((chave) => {
            tocados.add(chave);
            if (validar(chave) && !primeiroInvalido) primeiroInvalido = campos[chave];
        });

        if (!termos.checked) {
            setErroTermos('Você precisa aceitar os termos para continuar.');
            primeiroInvalido = primeiroInvalido || termos;
        }

        if (primeiroInvalido) {
            e.preventDefault();
            primeiroInvalido.focus();
            return;
        }

        submit.classList.add('is-loading');
        submit.disabled = true;
    });

    /* Parallax sutil da aurora seguindo o mouse ----------------- */
    const reduzMov = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ponteiroFino = matchMedia('(pointer: fine)').matches;

    if (!reduzMov && ponteiroFino) {
        const aurora = $('.aurora');
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
