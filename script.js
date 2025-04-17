document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signup-form");
  
    // Limitar a data de nascimento para no máximo 18 anos atrás
    const nascimentoInput = document.getElementById("nascimento");
    if (nascimentoInput) {
      const hoje = new Date();
      const maxDate = new Date(hoje.getFullYear() - 18, hoje.getMonth(), hoje.getDate());
      nascimentoInput.max = maxDate.toISOString().split("T")[0]; // formato: yyyy-mm-dd
    }
  
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Impede envio automático
      let valido = true;
  
      // Pega valores
      const nome = document.getElementById("nome").value.trim();
      const nascimento = document.getElementById("nascimento").value;
      const email = document.getElementById("email").value.trim();
      const cep = document.getElementById("cep").value.replace(/\D/g, "");
  
      // Limpa mensagens de erro
      document.querySelectorAll(".erro").forEach(e => e.textContent = "");
  
      // Validações
      if (nome === "") {
        document.getElementById("erro-nome").textContent = "Informe seu nome.";
        valido = false;
      }
  
      if (!nascimento) {
        document.getElementById("erro-nascimento").textContent = "Informe sua data de nascimento.";
        valido = false;
      } else {
        const hoje = new Date();
        const dataNasc = new Date(nascimento);
        const idade = hoje.getFullYear() - dataNasc.getFullYear();
        const mes = hoje.getMonth() - dataNasc.getMonth();
        const ajustada = mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate()) ? idade - 1 : idade;
  
        if (ajustada < 18) {
          document.getElementById("erro-nascimento").textContent = "Você deve ter pelo menos 18 anos.";
          valido = false;
        }
      }
  
      if (email === "" || !email.includes("@")) {
        document.getElementById("erro-email").textContent = "E-mail inválido.";
        valido = false;
      }
  
      if (cep.length !== 8) {
        document.getElementById("erro-cep").textContent = "CEP inválido.";
        valido = false;
      }
  
      if (valido) {
        alert("Conta criada com sucesso!");
        form.reset();
        document.getElementById("endereco").value = "";
      }
    });
  
    // Autopreenchimento do endereço via CEP
    document.getElementById("cep").addEventListener("blur", function () {
      const cep = this.value.replace(/\D/g, "");
      const erroCep = document.getElementById("erro-cep");
  
      if (cep.length !== 8) {
        erroCep.textContent = "CEP inválido.";
        return;
      }
  
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (data.erro) {
            erroCep.textContent = "CEP não encontrado.";
            document.getElementById("endereco").value = "";
          } else {
            erroCep.textContent = "";
            document.getElementById("endereco").value =
              `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          }
        })
        .catch(() => {
          erroCep.textContent = "Erro ao buscar o CEP.";
          document.getElementById("endereco").value = "";
        });
    });
  });
  
