const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
if (!usuario) window.location.href = 'login.html';

// Elementos do perfil
const postagensContainer = document.getElementById('postagensPerfil');
const nomePerfil = document.getElementById('nomePerfil');
const emailPerfil = document.getElementById('emailPerfil');
const enderecoPerfil = document.getElementById('enderecoPerfil');
const imgPerfil = document.getElementById('imgPerfil');
const logoutBtn = document.getElementById('logoutBtn');

// Exibir informações do usuário
function exibirPerfil() {
  nomePerfil.textContent = usuario.nome || 'Nome não definido';
  emailPerfil.textContent = usuario.email || 'Email não definido';
  enderecoPerfil.textContent = `Endereço: ${usuario.endereco || 'Não informado'}`;
  imgPerfil.src = usuario.fotoPerfil || 'assets/imagens/usuario-default.png';
}

// Formata data para exibição
function formatarData(data) {
  return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// Carregar postagens do usuário
function carregarPostagensPerfil() {
  postagensContainer.innerHTML = '';

  if (!usuario.postagens || usuario.postagens.length === 0) {
    postagensContainer.innerHTML = '<p>Você não fez nenhuma postagem ainda.</p>';
    return;
  }

  usuario.postagens.slice().reverse().forEach((post) => {
    const div = document.createElement('div');
    div.className = 'postagem-card';

    const imagemHTML = post.imagem ? `<img src="${post.imagem}" class="imagem-postagem" alt="Imagem da postagem">` : '';

    div.innerHTML = `
      <p><strong>${post.nomeUsuario || usuario.nome}</strong>: ${post.texto}</p>
      ${imagemHTML}
      <div class="postagem-data">${formatarData(post.data)}</div>
      <button class="excluir-postagem" data-data="${post.data}">Excluir</button>
    `;

    postagensContainer.appendChild(div);
  });

  // Botões de exclusão
  document.querySelectorAll('.excluir-postagem').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dataAlvo = e.target.getAttribute('data-data');
      excluirPostagemPerfil(dataAlvo);
    });
  });
}

// Excluir postagem
function excluirPostagemPerfil(dataAlvo) {
  let feedGlobal = JSON.parse(localStorage.getItem('feedGlobal')) || [];
  feedGlobal = feedGlobal.filter(p => !(p.data === dataAlvo && p.emailUsuario === usuario.email));
  localStorage.setItem('feedGlobal', JSON.stringify(feedGlobal));

  usuario.postagens = usuario.postagens.filter(p => !(p.data === dataAlvo));
  atualizarUsuarioLocalStorage();
  carregarPostagensPerfil();
}

// Atualizar localStorage
function atualizarUsuarioLocalStorage() {
  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const idx = usuarios.findIndex(u => u.email === usuario.email);
  if (idx !== -1) {
    usuarios[idx] = usuario;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
  }
}

// Logout
logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'login.html';
});

// Inicialização
exibirPerfil();
carregarPostagensPerfil();

// -------- CORREÇÃO DA EDIÇÃO DO PERFIL --------

// Elementos da edição
const btnEditarPerfil = document.getElementById('btnEditarPerfil');
const secaoEditar = document.querySelector('.perfil-editar');
const formEditar = document.getElementById('formEditarPerfil');
const nomeEdit = document.getElementById('nomeEdit');
const emailEdit = document.getElementById('emailEdit');
const senhaEdit = document.getElementById('senhaEdit');
const cepEdit = document.getElementById('cepEdit');
const enderecoEdit = document.getElementById('enderecoEdit');
const fotoPerfilEdit = document.getElementById('fotoPerfilEdit');
const btnCancelarEditar = document.getElementById('btnCancelarEditar');

// Mostrar/ocultar o formulário
btnEditarPerfil?.addEventListener('click', () => {
  secaoEditar.classList.toggle('hidden');
  nomeEdit.value = usuario.nome || '';
  emailEdit.value = usuario.email || '';
  enderecoEdit.value = usuario.endereco || '';
  cepEdit.value = usuario.cep || '';
});

// Cancelar edição
btnCancelarEditar?.addEventListener('click', () => {
  secaoEditar.classList.add('hidden');
});

// Salvar alterações
formEditar?.addEventListener('submit', (e) => {
  e.preventDefault();

  if (nomeEdit.value.trim()) usuario.nome = nomeEdit.value.trim();
  if (emailEdit.value.trim()) usuario.email = emailEdit.value.trim();
  if (enderecoEdit.value.trim()) usuario.endereco = enderecoEdit.value.trim();
  if (cepEdit.value.trim()) usuario.cep = cepEdit.value.trim();
  if (senhaEdit.value.trim()) usuario.senha = senhaEdit.value.trim();

  const foto = fotoPerfilEdit.files[0];
  if (foto) {
    const reader = new FileReader();
    reader.onload = function (e) {
      usuario.fotoPerfil = e.target.result;
      salvarAlteracoes();
    };
    reader.readAsDataURL(foto);
  } else {
    salvarAlteracoes();
  }
});

function salvarAlteracoes() {
  atualizarUsuarioLocalStorage();
  alert('Informações atualizadas!');
  exibirPerfil();
  secaoEditar.classList.add('hidden');
}

// -------- LÓGICA DE POSTAGEM --------
const btnPostar = document.getElementById('btnPostar');
const inputPostagem = document.getElementById('inputPostagem');
const inputMidia = document.getElementById('inputMídia');

btnPostar?.addEventListener('click', () => {
  const texto = inputPostagem.value.trim();
  const midia = inputMidia.files[0];

  if (!texto && !midia) {
    alert('Digite algo ou selecione uma mídia para postar.');
    return;
  }

  const novaPostagem = {
    nomeUsuario: usuario.nome,
    emailUsuario: usuario.email,
    texto: texto,
    data: new Date().toISOString(),
    imagem: null
  };

  if (midia) {
    const reader = new FileReader();
    reader.onload = function (e) {
      novaPostagem.imagem = e.target.result;
      salvarPostagem(novaPostagem);
    };
    reader.readAsDataURL(midia);
  } else {
    salvarPostagem(novaPostagem);
  }

  inputPostagem.value = '';
  inputMidia.value = '';
});

function salvarPostagem(post) {
  // Adiciona no feed global
  const feedGlobal = JSON.parse(localStorage.getItem('feedGlobal')) || [];
  feedGlobal.push(post);
  localStorage.setItem('feedGlobal', JSON.stringify(feedGlobal));

  // Adiciona no perfil do usuário
  usuario.postagens = usuario.postagens || [];
  usuario.postagens.push(post);
  atualizarUsuarioLocalStorage();

  carregarPostagensPerfil();
}
