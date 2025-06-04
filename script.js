// SCRIPT GERAL GYM HARD

// Utils
function mostrarMensagem(elemento, msg, sucesso = true) {
  elemento.textContent = msg;
  elemento.className = sucesso ? 'mensagem-sucesso' : 'mensagem-erro';
}

function validarEmail(email) {
  const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return re.test(email.toLowerCase());
}

function formatarData(data) {
  return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function redirecionar(url) {
  window.location.href = url;
}

// Salvar imagem em base64 no LocalStorage
function lerImagemComoBase64(inputFile, callback) {
  const file = inputFile.files[0];
  if (!file) {
    callback(null);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    callback(reader.result);
  };
  reader.readAsDataURL(file);
}

// Pegar dados do endereço pelo CEP via API (viacep)
function buscarEnderecoPorCep(cep, enderecoInput, mensagemElemento = null) {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) {
    if (mensagemElemento) mostrarMensagem(mensagemElemento, 'CEP inválido.', false);
    enderecoInput.value = '';
    return;
  }

  fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
    .then((resp) => resp.json())
    .then((dados) => {
      if (dados.erro) {
        if (mensagemElemento) mostrarMensagem(mensagemElemento, 'CEP não encontrado.', false);
        enderecoInput.value = '';
      } else {
        enderecoInput.value = dados.logradouro || '';
        if (mensagemElemento) mensagemElemento.textContent = '';
      }
    })
    .catch(() => {
      if (mensagemElemento) mostrarMensagem(mensagemElemento, 'Erro ao buscar CEP.', false);
    });
}

// =====================================
// CADASTRO
if (document.getElementById('cadastroForm')) {
  const form = document.getElementById('cadastroForm');
  const mensagem = document.getElementById('mensagem');
  const cepInput = form.cep;
  const enderecoInput = form.endereco;

  cepInput.addEventListener('input', () => {
    if (cepInput.value.length >= 8) {
      buscarEnderecoPorCep(cepInput.value, enderecoInput, cidadeInput, mensagem);
    } else {
      cidadeInput.value = '';
      enderecoInput.value = '';
      mensagem.textContent = '';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const senha = form.senha.value.trim();
    const cep = form.cep.value.trim();
    const endereco = form.endereco.value.trim();

    if (!nome || !email || !senha || !cep || !endereco) {
      mostrarMensagem(mensagem, 'Por favor, preencha todos os campos.', false);
      return;
    }

    if (!validarEmail(email)) {
      mostrarMensagem(mensagem, 'Email inválido.', false);
      return;
    }

    if (senha.length < 6) {
      mostrarMensagem(mensagem, 'A senha deve ter pelo menos 6 caracteres.', false);
      return;
    }

    // Verificar se email já existe
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.some(u => u.email === email)) {
      mostrarMensagem(mensagem, 'Email já cadastrado.', false);
      return;
    }

    lerImagemComoBase64(form.fotoPerfil, (imagemBase64) => {
      const novoUsuario = {
        id: Date.now(),
        nome,
        email,
        senha,
        cep,
        endereco,
        fotoPerfil: imagemBase64 || 'assets/imagens/usuario-default.png',
        postagens: []
      };

      usuarios.push(novoUsuario);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      mostrarMensagem(mensagem, 'Cadastro realizado com sucesso! Redirecionando...', true);

      setTimeout(() => {
        redirecionar('login.html');
      }, 1800);
    });
  });
}

// =====================================
// LOGIN
if (document.getElementById('loginForm')) {
  const form = document.getElementById('loginForm');
  const mensagemLogin = document.getElementById('mensagemLogin');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = form.emailLogin.value.trim().toLowerCase();
    const senha = form.senhaLogin.value.trim();

    if (!email || !senha) {
      mostrarMensagem(mensagemLogin, 'Preencha todos os campos.', false);
      return;
    }

    if (!validarEmail(email)) {
      mostrarMensagem(mensagemLogin, 'Email inválido.', false);
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
      mostrarMensagem(mensagemLogin, 'Email ou senha incorretos.', false);
      return;
    }

    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    mostrarMensagem(mensagemLogin, 'Login efetuado! Redirecionando...', true);

    setTimeout(() => {
      redirecionar('feed.html');
    }, 1400);
  });
}

// =====================================
// FEED
if (document.getElementById('btnPostar')) {
  const btnPostar = document.getElementById('btnPostar');
  const txtPostagem = document.getElementById('txtPostagem');
  const postagensContainer = document.getElementById('postagens');
  const logoutBtn = document.getElementById('logoutBtn');

  function carregarPostagens() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
      redirecionar('login.html');
      return;
    }
    // Carregar postagens do usuário
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === usuarioLogado.email);

    if (!usuario) {
      localStorage.removeItem('usuarioLogado');
      redirecionar('login.html');
      return;
    }

    postagensContainer.innerHTML = '';
    if (usuario.postagens.length === 0) {
      postagensContainer.innerHTML = '<p>Nenhuma postagem ainda.</p>';
      return;
    }

    usuario.postagens.slice().reverse().forEach((post, idx) => {
      const div = document.createElement('div');
      div.className = 'postagem-card';
      div.innerHTML = `
        <p>${post.texto}</p>
        <div class="postagem-data">${formatarData(post.data)}</div>
        <button class="excluir-postagem" data-index="${idx}">Excluir</button>
      `;
      postagensContainer.appendChild(div);
    });

    // Adicionar eventos para excluir
    document.querySelectorAll('.excluir-postagem').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        excluirPostagem(index);
      });
    });
  }

  function excluirPostagem(indexReverso) {
    // indexReverso é índice da postagem na lista invertida (mais recente primeiro)
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let usuario = usuarios.find(u => u.email === usuarioLogado.email);

    if (!usuario) return;

    // Converter índice invertido para índice normal
    const indexNormal = usuario.postagens.length - 1 - indexReverso;

    usuario.postagens.splice(indexNormal, 1);

    // Atualiza array de usuários
    usuarios = usuarios.map(u => u.email === usuario.email ? usuario : u);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    carregarPostagens();
  }

  btnPostar.addEventListener('click', () => {
    const texto = txtPostagem.value.trim();
    if (texto.length === 0) return alert('Escreva algo antes de postar.');
    if (texto.length > 500) return alert('Limite de 500 caracteres.');

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let usuario = usuarios.find(u => u.email === usuarioLogado.email);

    if (!usuario) return;

    usuario.postagens.push({ texto, data: new Date() });

    usuarios = usuarios.map(u => u.email === usuario.email ? usuario : u);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

    txtPostagem.value = '';
    carregarPostagens();
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    redirecionar('login.html');
  });

  carregarPostagens();
}

// =====================================
// PERFIL
if (document.getElementById('btnSalvarPerfil')) {
  const formPerfil = document.getElementById('perfilForm');
  const mensagemPerfil = document.getElementById('mensagemPerfil');
  const logoutBtnPerfil = document.getElementById('logoutBtnPerfil');

  function carregarDadosPerfil() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
      redirecionar('login.html');
      return;
    }
    formPerfil.nome.value = usuarioLogado.nome;
    formPerfil.email.value = usuarioLogado.email;
    formPerfil.cep.value = usuarioLogado.cep;
    formPerfil.endereco.value = usuarioLogado.endereco;

    if (usuarioLogado.fotoPerfil) {
      document.getElementById('imgPerfil').src = usuarioLogado.fotoPerfil;
    }
  }

  formPerfil.cep.addEventListener('input', () => {
    if (formPerfil.cep.value.length >= 8) {
      buscarEnderecoPorCep(formPerfil.cep.value, formPerfil.endereco, formPerfil.cidade, mensagemPerfil);
    }
  });

  formPerfil.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = formPerfil.nome.value.trim();
    const email = formPerfil.email.value.trim().toLowerCase();
    const cep = formPerfil.cep.value.trim();
    const endereco = formPerfil.endereco.value.trim();

    if (!nome || !email || !cep || !endereco) {
      mostrarMensagem(mensagemPerfil, 'Por favor, preencha todos os campos.', false);
      return;
    }

    if (!validarEmail(email)) {
      mostrarMensagem(mensagemPerfil, 'Email inválido.', false);
      return;
    }

    lerImagemComoBase64(formPerfil.fotoPerfil, (imagemBase64) => {
      const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
      let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      let usuario = usuarios.find(u => u.email === usuarioLogado.email);

      if (!usuario) {
        redirecionar('login.html');
        return;
      }

      usuario.nome = nome;
      usuario.email = email;
      usuario.cep = cep;
      usuario.endereco = endereco;

      if (imagemBase64) {
        usuario.fotoPerfil = imagemBase64;
      }

      usuarios = usuarios.map(u => u.email === usuarioLogado.email ? usuario : u);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

      mostrarMensagem(mensagemPerfil, 'Perfil atualizado com sucesso!', true);
    });
  });

  logoutBtnPerfil.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    redirecionar('login.html');
  });

  carregarDadosPerfil();
}

// =====================================
// VISUALIZAR PERFIL
if (document.getElementById('logoutBtnVisualizar')) {
  const logoutBtnVisualizar = document.getElementById('logoutBtnVisualizar');

  logoutBtnVisualizar.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    redirecionar('login.html');
  });

  // Carregar dados do perfil para visualização
  function carregarVisualizarPerfil() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
      redirecionar('login.html');
      return;
    }
    document.getElementById('nomeVisualizar').textContent = usuarioLogado.nome;
    document.getElementById('emailVisualizar').textContent = usuarioLogado.email;
    document.getElementById('enderecoVisualizar').textContent = 'Endereço: ' + usuarioLogado.endereco;
    document.getElementById('imgVisualizar').src = usuarioLogado.fotoPerfil || 'assets/imagens/usuario-default.png';
  }

  carregarVisualizarPerfil();
}
