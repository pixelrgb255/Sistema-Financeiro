const Modal = {
	open() {
		// Abrir modal(Adicionar a classe active ao modal)
		document.querySelector('.modal-overlay').classList.add('active');
	},
	close() {
		// Fechando o modal(Removendo a classe active do modal)
		document.querySelector('.modal-overlay').classList.remove('active');
	}
};

const Storage = {
	get() {
		console.log(localStorage);

		return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
	},
	set(transactions) {
		localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions));
	}
};

Storage.get();

const Transaction = {
	all: Storage.get(),
	add(transaction) {
		// Adicionando uma nova transação à aplicação
		Transaction.all.push(transaction);
		App.reload();
	},
	remove(index) {
		// Removendo uma transação da aplicação
		Transaction.all.splice(index, 1);
		App.reload();
	},
	incomes() {
		//Valor padrão da variável
		let income = 0;
		// Pegar todas as transações
		Transaction.all.forEach((transaction) => {
			// Verificar se é maior que zero.
			if (transaction.amount > 0) {
				// Se for, somar à variavel
				income += transaction.amount;
			}
		});
		// Retornar o valor da varíavel que criamos
		return income;
		//Este código se repete para cada transação
	},
	expenses() {
		// Similar ao income, só que ao invés de somar valores positivos, soma valores negativos.
		let expense = 0;
		Transaction.all.forEach((transaction) => {
			if (transaction.amount < 0) {
				expense += transaction.amount;
			}
		});
		return expense;
	},
	total() {
		// Estamos retornando o valor total das entradas menos o valor das despesas (Incomes - Expenses), para obter quanto dinheiro o usuário tem.
		return Transaction.incomes() + Transaction.expenses();
	}
};

const DOM = {
	transactionsContainer: document.querySelector('#data-table tbody'),

	addTransaction(transaction, index) {
		const tr = document.createElement('tr');
		tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
		tr.dataset.index = index;
		DOM.transactionsContainer.appendChild(tr);
	},
	innerHTMLTransaction(transaction, index) {
		const CSSclass = transaction.amount > 0 ? 'income' : 'expense';

		const amount = Utils.formatCurrency(transaction.amount);

		const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação" />
      </td>`;
		return html;
	},
	updateBalance() {
		document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(
			Transaction.incomes()
		);
		document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(
			Transaction.expenses()
		);
		document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
	},
	clearTransactions() {
		// Limpando a table de transações
		DOM.transactionsContainer.innerHTML = '';
	}
};

const Utils = {
	formatAmount(value) {
		value = Number(value) * 100;
		return value;
	},

	formatDate(date) {
		const splittedDate = date.split(`-`);
		return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
	},

	formatCurrency(value) {
		const signal = Number(value) < 0 ? '-' : '';

		value = String(value).replace(/\D/g, '');

		value = Number(value) / 100;

		value = value.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		});

		return signal + value;
		// console.log(signal + value);
	}
};

const Form = {
	description: document.querySelector('input#description'),
	amount: document.querySelector('input#amount'),
	date: document.querySelector('input#date'),
	getValues() {
		return {
			description: Form.description.value,
			amount: Form.amount.value,
			date: Form.date.value
		};
	},

	validateFields() {
		const { description, amount, date } = Form.getValues();
		if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
			throw new Error('Por favor, preencha todos os campos');
		}
	},

	formatValues() {
		let { description, amount, date } = Form.getValues();
		amount = Utils.formatAmount(amount);
		date = Utils.formatDate(date);

		return {
			description,
			amount,
			date
		};
	},

	saveTransaction(transaction) {
		Transaction.add(transaction);
	},

	clearFields() {
		Form.description.value = '';
		Form.amount.value = '';
		Form.date.value = '';
	},

	submit(event) {
		// Previnindo o formulário de fazer ações que não programamos
		event.preventDefault();

		try {
			// Verificando se todas as informações do formulário foram preenchidas
			Form.validateFields();

			// Formatar os dados para salvar
			const transaction = Form.formatValues();

			// Salvar
			Form.saveTransaction(transaction);

			// Apagar os dados do formulário
			Form.clearFields();

			// Fechar o Modal
			Modal.close();

			// Atualizar a aplicação
			// App.reload();
			// Foi descenessário esta função pois, quando fazemos o saveTransaction, naquela função já atualiza a aplicação.
		} catch (error) {
			alert(error.message);
		}
	}
};

const App = {
	init() {
		Transaction.all.forEach((transaction, index) => {
			DOM.addTransaction(transaction, index);
		});
		DOM.updateBalance();
		Storage.set(Transaction.all);
	},
	reload() {
		DOM.clearTransactions();
		App.init();
	}
};

App.init();
