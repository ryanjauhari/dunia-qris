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
Url servernya berikut ini 
``POST "http://localhost:3000/api/buatinvoice"``

Untuk kebutuhan development, callback dii arahin ke /api/callback di lokal server. Ini bisa di arahkan ke mana saja project yang membutuhkan
mekanisme pembayaran. Satu QRIS bisa untuk banyak aplikasi yang membutuhkan pembayaran, tapi jika transaksinya tinggi harap di adjust untuk rentang kode unik dari 1-2000 agar lebih banyak slot untuk di pakai.

Masih ada bugs di sini, beberapa bug itu merupakan rate limiting nanti bakalan di atasi.