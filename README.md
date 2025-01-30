# dunia-qris
API untuk mengakomodir sebuah program alias middleware, ini di gunakan di sisi backend. Dan tidak untuk di buat menjadi restfull API yang berjalan di jaringan publik, terlalu beresiko. 
Tujuan dari program ini adalah menyediakna even driven asyncronous queue programing dan mempertahankan nilai angka unik untuk invoicing pada QRIS statis. 
- Menerima permintaan buat invoice beserta callback API.
- Memproses permintaan secara asyncronous processing.
- Mendengarkan event alias cekmutasi selama 5 menit.
- Menirim callback PAID, atau EXPIRED
