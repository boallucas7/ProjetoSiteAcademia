document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  const cep = document.getElementById('cep').value.trim();
  const enderecoInput = document.getElementById('endereco');
  let endereco = enderecoInput.value.trim();
  const fotoPerfilInput = document.getElementById('fotoPerfil');
  const mensagemEl = document.getElementById('mensagem');

  mensagemEl.textContent = ''; // Limpa mensagens anteriores

  // Validação campos obrigatórios
  if (!nome || !email || !senha || !confirmarSenha || !cep || !endereco) {
    mensagemEl.textContent = 'Por favor, preencha todos os campos obrigatórios.';
    return;
  }

  // Validação e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    mensagemEl.textContent = 'Por favor, insira um e-mail válido.';
    return;
  }

  // Validação senhas
  if (senha !== confirmarSenha) {
    mensagemEl.textContent = 'As senhas não conferem!';
    return;
  }

  // Validação CEP (8 dígitos numéricos)
  if (!/^\d{8}$/.test(cep)) {
    mensagemEl.textContent = 'Por favor, insira um CEP válido com 8 números.';
    return;
  }

  // Busca usuários no LocalStorage
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  // Verifica se email já cadastrado
  if (usuarios.some(u => u.email === email)) {
    mensagemEl.textContent = 'Email já cadastrado!';
    return;
  }

  // Função para buscar endereço via API do CEP (ViaCEP)
  async function buscarEndereco(cep) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('Erro na requisição do CEP.');
      const data = await response.json();
      if (data.erro) throw new Error('CEP não encontrado.');
      return data.logradouro || '';
    } catch (error) {
      return '';
    }
  }

  // Se o endereço estiver vazio, tenta preencher via CEP
  if (!endereco) {
    endereco = await buscarEndereco(cep);
    if (!endereco) {
      mensagemEl.textContent = 'Endereço não encontrado pelo CEP. Por favor, preencha manualmente.';
      return;
    }
    enderecoInput.value = endereco; // Preenche o campo com o resultado
  }

  // Processar foto de perfil: converte imagem para base64 para armazenar no LocalStorage
  let fotoPerfil = '';
  if (fotoPerfilInput.files && fotoPerfilInput.files[0]) {
    const file = fotoPerfilInput.files[0];
    fotoPerfil = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  // Cria o objeto do novo usuário
  const novoUsuario = {
    nome,
    email,
    senha,
    cep,
    endereco,
    fotoPerfil,
    posts: []
  };

  // Salva no LocalStorage
  usuarios.push(novoUsuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  // Exibe mensagem de sucesso
  mensagemEl.style.color = 'green';
  mensagemEl.textContent = 'Cadastro realizado com sucesso! Redirecionando...';

  // Redirecionar para login após 2 segundos
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 2000);
});

// Evento para preencher endereço automaticamente ao perder o foco do CEP
document.getElementById('cep').addEventListener('blur', async () => {
  const cep = document.getElementById('cep').value.trim();
  const enderecoInput = document.getElementById('endereco');
  const mensagemEl = document.getElementById('mensagem');
  mensagemEl.textContent = '';

  if (/^\d{8}$/.test(cep)) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        enderecoInput.value = data.logradouro || '';
      } else {
        mensagemEl.textContent = 'CEP não encontrado.';
        enderecoInput.value = '';
      }
    } catch {
      mensagemEl.textContent = 'Erro ao buscar o CEP.';
      enderecoInput.value = '';
    }
  }
});
