document.addEventListener('DOMContentLoaded', () => {
    // Load books when page loads
    loadBooks();

    // Add a new book
    document.getElementById('addBookForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;
        const isbn = document.getElementById('bookISBN').value;

        if (title && author && isbn) {
            addBook(title, author, isbn);
            document.getElementById('addBookForm').reset();
        } else {
            alert('Please fill all fields!');
        }
    });

    // Search books
    document.getElementById('searchBtn').addEventListener('click', searchBooks);
});

// Book functions
function addBook(title, author, isbn, status = 'Available') {
    const books = getBooksFromStorage();
    const newBook = { id: Date.now(), title, author, isbn, status };
    books.push(newBook);
    saveBooksToStorage(books);
    loadBooks();
}

function removeBook(id) {
    const books = getBooksFromStorage();
    const updatedBooks = books.filter(book => book.id !== id);
    saveBooksToStorage(updatedBooks);
    loadBooks();
}

function checkoutBook(id) {
    const books = getBooksFromStorage();
    const book = books.find(book => book.id === id);
    if (book) {
        book.status = book.status === 'Available' ? 'Checked Out' : 'Available';
        saveBooksToStorage(books);
        loadBooks();
    }
}

function searchBooks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const books = getBooksFromStorage();
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm)
    );
    renderBooks(filteredBooks);
}

// Storage helpers
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('libraryBooks')) || [];
}

function saveBooksToStorage(books) {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}

// Render books in table
function loadBooks() {
    const books = getBooksFromStorage();
    renderBooks(books);
}

function renderBooks(books) {
    const tableBody = document.getElementById('booksTableBody');
    tableBody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.status}</td>
            <td>
                <button onclick="checkoutBook(${book.id})">${book.status === 'Available' ? 'Check Out' : 'Return'}</button>
                <button onclick="removeBook(${book.id})">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}