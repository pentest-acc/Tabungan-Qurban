   // 1. Ambil data akun yang sedang login
    const session = JSON.parse(localStorage.getItem('userAccount'));
    
    if(session) {
        document.getElementById('userInput').value = session.username;
        document.getElementById('namaInput').value = session.namaLengkap; // Pastikan saat daftar, namaLengkap disimpan
    }

    // 2. Logika Simpan Data ke Global Array
    document.getElementById('formMenabung').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const dataBaru = {
            username: document.getElementById('userInput').value,
            nama: document.getElementById('namaInput').value,
            jumlah: document.getElementById('jmlInput').value,
            tanggal: document.getElementById('tglInput').value
        };

        // Ambil data lama atau buat array baru jika kosong
        let listTabungan = JSON.parse(localStorage.getItem('dataTabunganQurban')) || [];
        listTabungan.push(dataBaru);
        
        // Simpan kembali ke localStorage
        localStorage.setItem('dataTabunganQurban', JSON.stringify(listTabungan));
        
        alert("Setoran berhasil disimpan!");
        window.location.href = 'beranda_biasa.html';
});



//Menampilkan Data di Beranda (Keduanya)
function loadTabelTabungan() {
    const tableBody = document.querySelector("#tabelQurban tbody");
    const dataGlobal = JSON.parse(localStorage.getItem('dataTabunganQurban')) || [];
    
    tableBody.innerHTML = ""; // Bersihkan tabel
    
    dataGlobal.forEach((item, index) => {
        let row = `<tr>
            <td>${index + 1}</td>
            <td>${item.username}</td>
            <td>${item.nama}</td>
            <td>Rp ${parseInt(item.jumlah).toLocaleString()}</td>
            <td>${item.tanggal}</td>`;
        
        // Cek jika ini POV Admin, tambahkan tombol Edit/Hapus
        if(isAdminPage) { 
            row += `<td><button>Edit</button> <button>Hapus</button></td>`;
        }
        
        row += `</tr>`;
        tableBody.innerHTML += row;
    });
}