# dunia-qris
API untuk mengakomodir sebuah program alias middleware, ini di gunakan di sisi backend. Dan tidak untuk di buat menjadi restfull API yang berjalan di jaringan publik, terlalu beresiko. 
Tujuan dari program ini adalah menyediakan even driven asyncronous queue programing dan mempertahankan nilai angka unik untuk invoicing pada QRIS statis. 
- Menerima permintaan buat invoice beserta callback API.
- Memproses permintaan secara asyncronous processing.
- Mendengarkan event alias cekmutasi selama 5 menit.
- Menirim callback PAID, atau EXPIRED


**Instalasi**
Cara menginstall cukup mudah, di terminal manapun yang sudah terpasang git, npm, dan nodejs bisa run perintah berikut ini.\
``git clone https://github.com/ryanjauhari/dunia-qris.git && cd dunia-qris && npm install && npm start``

Server akan berjalan untuk menguji coba nya. Gunakan cURL, atau lebih gampang gunakan postman kirim data dalam file sampel-data.json atau sampel-invoice ke server. 
Url servernya berikut ini \
``JSON POST "http://localhost:3000/api/buatinvoice"``
| Parameter | Keterangan | Status |
|----------|----------|----------|
| merchant_code | kode merchant QRIS API OKECON** | wajib |
| api_key | API KEY QRIS API OKECON** | wajib |
| callback_url | URL valid untuk menerima callback ketika PAID/EXPIRED | wajib |
| amount | Jumlah bayar yang di inginkan | wajib |
| interval | Durasi invoice berlaku dalam mili detik | wajib |



/api/buatinvoice mengembalikan json dengan struktur format berikut
| Parameter | Keterangan |
|----------|----------|
| ok | status tindakan dalam format boolean true/false |
| error | Berisi pesan error jika ok nya false |
| invoice_id | Berisi kode ID invoice pelacakan dapat di simpan ke program mu. |
| amount | Berisi jumlah pembayaran yang di harapkan yang udah di tambah kode unik.|
| unique | Berisi kode unik yang di tambahkan ke invoice pembayaran. |


Callback, webhook yang di kirimkan oleh API ini berupa JSON juga dengan body seperti berikut
| Parameter | Keterangan 
|----------|----------|
| status | Berisi status bisa PAID/EXPIRED |
| invoice_id | Berisi ID invoice yang di berikan seejak generate invoice |
| data | Berisi data mutasi transaksi 1 baris objek array |


Untuk kebutuhan development, callback dii arahin ke /api/callback di lokal server. Ini bisa di arahkan ke mana saja project yang membutuhkan
mekanisme pembayaran. Satu QRIS bisa untuk banyak aplikasi yang membutuhkan pembayaran, tapi jika transaksinya tinggi harap di adjust untuk rentang kode unik dari 1-2000 agar lebih banyak slot untuk di pakai.


**Riwyat perubahan**\
Bugs: Transaksi tervalidasi dgn data yang usang/mutaisi lama.
Bug di atasi, menggunakan pendekatan cache  saat membuat invoice pertama. Cek mutasi akan mengecualikan data lama.

Bugs: pembuatan invoice kena rate limiting ketika ada lebih dari 4x permintaan.
Bugs di atasi, menghapus pengambilan cache mutasi dan menambahka tanggal sebagai parameter batas invoice di buat. Saat melakukan cek mutasi, pencarian hanya akan berfokus pada data yang tanggalnya lebih tingggi dari tanggal invoice di buat. 

Selengkapnya lihat di CHANGELOG.md