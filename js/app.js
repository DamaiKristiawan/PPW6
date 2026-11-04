/**
 * Praktikum 6: Komunikasi Data Asinkron Menggunakan AJAX & Fetch API
 * Sistem Informasi Data Mahasiswa (SIMA) - Waktu Praktikum: 90 Menit
 */

//Deklarasikan endpoint API
const API_URL = 'api/mahasiswa.php';

// 1. Seleksi Elemen DOM Utama
const tabelBody = document.getElementById('tabel-body-mahasiswa');
const inputSearch = document.getElementById('input-search');
const totalBadge = document.getElementById('total-mahasiswa-badge');
const totalInfo = document.getElementById('total-mahasiswa-info');
const alertBox = document.getElementById('alert-box');
const formTambah = document.getElementById('form-tambah-mahasiswa');

// Helper: Menampilkan Pesan Notifikasi Dinamis
function showAlert(message, type = 'success') {
    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.className = `alert-box alert-${type}`;
    alertBox.style.display = 'block';

    window.clearTimeout(showAlert.timeoutId);
    showAlert.timeoutId = window.setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

// 2. Fetch API GET: Mengambil Data Mahasiswa dari Server
async function loadMahasiswa(keyword = '') {
    if (!tabelBody) return;

    // tampilkan indikator loading
    tabelBody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 20px; color: var(--text-muted);">
                Memuat data dari server...
            </td>
        </tr>
    `;

    try {
        const url = new URL(API_URL, window.location.href);
        if (keyword) url.searchParams.set('search', keyword);

        //Percobaan 6-1 Langkah 4 susun url request
        const url = keyword ? `${API_URL}?search=${encodeURIComponent(keyword)}` : API_URL;
        
        //Percobaan 6-1 Langkah 4 kirim request
        const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        //Percobaan 6-1 Langkah 4 kirim ekstrak json 
        const result = await response.json();
                if (result.status === 'success' && Array.isArray(result.data)) {
                    renderTable(result.data, keyword);
        } else {
            showAlert(result.message, 'danger');
        }
      
    } catch (error) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 8;
        cell.style.cssText = 'text-align: center; padding: 20px; color: #ef4444;';
        cell.textContent = `Gagal memuat data dari REST API: ${error.message}`;
        row.appendChild(cell);
        tabelBody.replaceChildren(row);
        if (totalInfo) totalInfo.textContent = 'Data gagal dimuat';
    }
}

// 3. Render Baris Tabel Dinamis ke DOM
function renderTable(mahasiswaList = [], keyword = '') {
    tabelBody.innerHTML = '';

    if (totalBadge) totalBadge.textContent = mahasiswaList.length;
    if (totalInfo) {
        totalInfo.textContent = keyword
            ? `Ditemukan ${mahasiswaList.length} mahasiswa untuk "${keyword}"`
            : `Menampilkan ${mahasiswaList.length} mahasiswa`;
    }

    if (mahasiswaList.length === 0) {
        tabelBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Tidak ada data mahasiswa yang cocok.
                </td>
            </tr>
        `;
        return;
    }

    mahasiswaList.forEach((mhs, index) => {
        const tr = document.createElement('tr');
        const photoCell = document.createElement('td');
        const photo = document.createElement('img');
        photo.src = 'img/avatar-default.svg';
        photo.alt = `Foto ${mhs.nama}`;
        photo.className = 'avatar-img';
        photo.width = 36;
        photo.height = 36;
        photoCell.appendChild(photo);

        const npmCell = document.createElement('td');
        const npm = document.createElement('strong');
        npm.textContent = mhs.npm;
        npmCell.appendChild(npm);

        const nameCell = document.createElement('td');
        nameCell.textContent = mhs.nama;

        const programCell = document.createElement('td');
        const program = document.createElement('span');
        program.className = 'badge';
        program.textContent = mhs.program_studi;
        programCell.appendChild(program);

        const emailCell = document.createElement('td');
        const email = document.createElement('a');
        email.href = `mailto:${mhs.email}`;
        email.className = 'link-email';
        email.textContent = mhs.email;
        emailCell.appendChild(email);

        const actionCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'btn btn-warning btn-sm';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => openEditModal(mhs.id));

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.textContent = 'Hapus';
        deleteButton.addEventListener('click', () => deleteMahasiswa(mhs.id, mhs.nama));
        actionCell.append(editButton, ' ', deleteButton);

        const numberCell = document.createElement('td');
        numberCell.textContent = String(index + 1);
        const yearCell = document.createElement('td');
        yearCell.textContent = mhs.angkatan;
        tr.append(numberCell, photoCell, npmCell, nameCell, programCell, yearCell, emailCell, actionCell);
        tabelBody.appendChild(tr);
    });
}

// Elemen DOM Modal Edit
const modalEdit = document.getElementById('modal-edit');
const formEdit = document.getElementById('form-edit-mahasiswa');
const editId = document.getElementById('edit-id');
const editnpm = document.getElementById('edit-npm');
const editNama = document.getElementById('edit-nama');
const editProdi = document.getElementById('edit-prodi');
const editAngkatan = document.getElementById('edit-angkatan');
const editEmail = document.getElementById('edit-email');

async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`);
        const result = await response.json();

        if (response.ok && result.data) {
            const mahasiswa = result.data;
            editId.value = mahasiswa.id;
            editnpm.value = mahasiswa.npm;
            editNama.value = mahasiswa.nama;
            editProdi.value = mahasiswa.program_studi;
            editAngkatan.value = mahasiswa.angkatan;
            editEmail.value = mahasiswa.email;
            modalEdit.classList.add('active');
        } else {
            showAlert(result.message || 'Gagal memuat detail mahasiswa', 'danger');
        }
    } catch (err) {
        showAlert(`Kesalahan jaringan: ${err.message}`, 'danger');
    }
}

function closeEditModal() {
    if (modalEdit) modalEdit.classList.remove('active');
}

if (modalEdit) {
    modalEdit.addEventListener('click', function (e) {
        if (e.target === modalEdit) closeEditModal();
    });
}

if (formEdit) {
    formEdit.addEventListener('submit', async function (e) {
        e.preventDefault();
        const id = editId.value;
        const payload = {
            npm: editnpm.value.trim(),
            nama: editNama.value.trim(),
            program_studi: editProdi.value,
            angkatan: parseInt(editAngkatan.value, 10),
            email: editEmail.value.trim()
        };

        try {
            const res = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showAlert(data.message, 'success');
                closeEditModal();
                loadMahasiswa(inputSearch ? inputSearch.value.trim() : '');
            } else {
                showAlert(data.message || 'Gagal memperbarui data', 'danger');
            }
        } catch (err) {
            showAlert(`Kesalahan jaringan: ${err.message}`, 'danger');
        }
    });
}

// 4. Fetch API POST: Menambahkan Data Baru Tanpa Reload
if (formTambah) {
    formTambah.addEventListener('submit', async function (event) {
        event.preventDefault();
        const dataMahasiswa = {
            npm: document.getElementById('npm').value.trim(),
            nama: document.getElementById('nama').value.trim(),
            program_studi: document.getElementById('program_studi').value,
            angkatan: parseInt(document.getElementById('angkatan').value, 10),
            email: document.getElementById('email').value.trim()
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataMahasiswa)
            });
            const result = await response.json();

            if (response.ok && result.status === 'success') {
                showAlert(result.message, 'success');
                formTambah.reset();
                loadMahasiswa(inputSearch ? inputSearch.value.trim() : '');
            } else {
                showAlert(result.message || 'Gagal menyimpan data', 'danger');
            }
        } catch (error) {
            showAlert(`Terjadi kesalahan koneksi: ${error.message}`, 'danger');
        }
    });


// 5. Fetch API DELETE: Menghapus Data Secara Asinkron
async function deleteMahasiswa(id, nama) {
    if (!confirm(`Apakah Anda yakin ingin menghapus mahasiswa "${nama}"?`)) return;

    try {
        const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
        const result = await response.json();

        if (response.ok && result.status === 'success') {
            showAlert(result.message, 'success');
            loadMahasiswa(inputSearch ? inputSearch.value.trim() : '');
        } else {
            showAlert(result.message || 'Gagal menghapus data', 'danger');
        }
    } catch (error) {
        showAlert(`Gagal menghapus: ${error.message}`, 'danger');
    }
}

// 6. Pencarian Real-Time (Live Search via Fetch API)
if (inputSearch) {
    let timer = null;
    inputSearch.addEventListener('input', function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            loadMahasiswa(inputSearch.value.trim());
        }, 300);
    });
}

// Inisialisasi: Panggil Data Pertama Kali
loadMahasiswa();
