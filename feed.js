const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
if (!usuario) window.location.href = 'login.html';

// Elementos comuns
const btnPostar = document.getElementById('btnPostar');
const txtPostagem = document.getElementById('txtPostagem') || document.getElementById('inputPostagem');
const inputImagem = document.getElementById('inputImagem') || document.getElementById('inputMídia');
const postagensContainerFeed = document.getElementById('postagens') || document.getElementById('postagensFeed');
const postagensContainerPerfil = document.getElementById('postagensPerfil');
const logoutBtn = document.getElementById('logoutBtn');

// Função para formatar data
function formatarData(data) {
  return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// Função para carregar o feed (todas as postagens)
function carregarPostagensFeed() {
  if (!postagensContainerFeed) return;
  const feedGlobal = JSON.parse(localStorage.getItem('feedGlobal')) || [];
  postagensContainerFeed.innerHTML = '';

  if (feedGlobal.length === 0) {
    postagensContainerFeed.innerHTML = '<p>Nenhuma postagem ainda.</p>';
    return;
  }

  feedGlobal.slice().reverse().forEach((post, idx) => {
    const div = document.createElement('div');
    div.className = 'postagem-card';

    const imagemHTML = post.imagem ? `<img src="${post.imagem}" alt="Imagem da postagem" class="imagem-postagem">` : '';

    div.innerHTML = `
      <p><strong>${post.nomeUsuario}</strong>: ${post.texto}</p>
      ${imagemHTML}
      <div class="postagem-data">${formatarData(post.data)}</div>
      ${post.emailUsuario === usuario.email ? `<button class="excluir-postagem" data-index="${idx}">Excluir</button>` : ''}
    `;
    postagensContainerFeed.appendChild(div);
  });

  document.querySelectorAll('.excluir-postagem').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const indexReverso = parseInt(e.target.getAttribute('data-index'));
      excluirPostagem(indexReverso);
    });
  });
}

// Função para carregar postagens do perfil do usuário
function carregarPostagensPerfil() {
  if (!postagensContainerPerfil) return;
  postagensContainerPerfil.innerHTML = '';

  if (!usuario.postagens || usuario.postagens.length === 0) {
    postagensContainerPerfil.innerHTML = '<p>Você não fez nenhuma postagem ainda.</p>';
    return;
  }

  usuario.postagens.slice().reverse().forEach(post => {
    const div = document.createElement('div');
    div.className = 'postagem-card';

    const imagemHTML = post.imagem ? `<img src="${post.imagem}" alt="Mídia Postada" class="imagem-postagem" />` : '';

    div.innerHTML = `
      <p><strong>${post.nomeUsuario}</strong>: ${post.texto}</p>
      ${imagemHTML}
      <div class="postagem-data">${formatarData(post.data)}</div>
    `;
    postagensContainerPerfil.appendChild(div);
  });
}

// Exibir dados do perfil
function exibirPerfil() {
  if (!document.getElementById('nomePerfil')) return;

  document.getElementById('nomePerfil').textContent = usuario.nome || 'Nome do Usuário';
  document.getElementById('emailPerfil').textContent = usuario.email || 'email@exemplo.com';
  document.getElementById('enderecoPerfil').textContent = `Endereço: ${usuario.endereco || 'Não informado'}`;

  const imgPerfil = document.getElementById('imgPerfil');
  imgPerfil.src = usuario.fotoPerfil || 'assets/imagens/usuario-default.png';

  carregarPostagensPerfil();
}

// Função para adicionar nova postagem (com ou sem imagem)
function adicionarPostagem(imagemBase64 = null) {
  const texto = txtPostagem.value.trim();
  if (texto.length === 0) return alert('Escreva algo antes de postar.');
  if (texto.length > 500) return alert('Limite de 500 caracteres.');

  const novaPostagem = {
    texto,
    imagem: imagemBase64,
    data: new Date(),
    nomeUsuario: usuario.nome,
    emailUsuario: usuario.email
  };

  // Adicionar ao feed
  const feedGlobal = JSON.parse(localStorage.getItem('feedGlobal')) || [];
  feedGlobal.push(novaPostagem);
  localStorage.setItem('feedGlobal', JSON.stringify(feedGlobal));

  // Adicionar ao usuário
  usuario.postagens = usuario.postagens || [];
  usuario.postagens.push(novaPostagem);

  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const idx = usuarios.findIndex(u => u.email === usuario.email);
  usuarios[idx] = usuario;
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

  txtPostagem.value = '';
  if (inputImagem) inputImagem.value = '';

  carregarPostagensFeed();
  carregarPostagensPerfil();
}

// Lê imagem e chama `adicionarPostagem`
function processarPostagem() {
  const arquivoImagem = inputImagem?.files?.[0];
  if (arquivoImagem) {
    const reader = new FileReader();
    reader.onload = (e) => {
      adicionarPostagem(e.target.result);
    };
    reader.readAsDataURL(arquivoImagem);
  } else {
    adicionarPostagem();
  }
}

// Excluir postagem (apenas o autor pode)
function excluirPostagem(indexReverso) {
  let feedGlobal = JSON.parse(localStorage.getItem('feedGlobal')) || [];
  const post = feedGlobal[feedGlobal.length - 1 - indexReverso];
  if (post.emailUsuario !== usuario.email) return alert('Você não pode excluir essa postagem.');

  const indexNormal = feedGlobal.length - 1 - indexReverso;
  feedGlobal.splice(indexNormal, 1);
  localStorage.setItem('feedGlobal', JSON.stringify(feedGlobal));

  // Remover também do perfil
  usuario.postagens = usuario.postagens.filter(p =>
    !(p.texto === post.texto && p.data === post.data && p.emailUsuario === post.emailUsuario)
  );

  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const idx = usuarios.findIndex(u => u.email === usuario.email);
  usuarios[idx] = usuario;
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

  carregarPostagensFeed();
  carregarPostagensPerfil();
}

// Evento de postagem
btnPostar?.addEventListener('click', () => {
  processarPostagem();
});

// Evento de logout
logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'login.html';
});

// Inicialização
exibirPerfil();
carregarPostagensFeed();
