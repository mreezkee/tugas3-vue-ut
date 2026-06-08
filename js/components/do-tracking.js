Vue.component("do-tracking", {
  template: "#tpl-tracking",
  props: ["trackingData", "paketList", "pengirimanList", "stokList"],

  data: function () {
    return {
      inputPencarian: "",
      searchQuery: "",

      // Modals
      showModalTambah: false,
      showModalProgress: false,
      isProcessing: false,
      isSuccess: false,

      // Form Tambah DO Baru
      formDO: {
        noDO: "",
        nim: "",
        nama: "",
        kodePaket: "",
        pengiriman: "",
        tanggalKirim: "",
        totalHarga: 0,
      },

      //Form Update Progress DO
      doTerpilih: null,
      formProgress: {
        statusBaru: "",
        keterangan: "",
      },

      statusPilihan: [
        "Proses Gudang",
        "Dalam Perjalanan",
        "Penjemputan",
        "Dikirim",
        "Sudah Diterima",
      ],
    };
  },

  //Fungsi Reaktif Computed
  computed: {
    //Merapihkan Data JSON Array of Object menjadi Array Datar yang mudah dibaca
    dataFlat: function () {
      if (!this.trackingData) return [];
      return this.trackingData.map((item) => {
        let noDO = Object.keys(item)[0];
        let detail = item[noDO];

        return { noDO: noDO, ...detail };
      });
    },

    //Fungsi Pencarian Berdasarkan no DO atau NIM
    doTersaring: function () {
      let hasil = this.dataFlat;

      if (this.searchQuery !== "") {
        let keyword = this.searchQuery.toLowerCase();
        hasil = hasil.filter(
          (item) =>
            item.noDO.toLowerCase().includes(keyword) ||
            item.nim.toLowerCase().includes(keyword),
        );
      }
      return hasil;
    },

    //Fungsi untuk mendapatkan nama paket dari kodePaket
    detailPaketTerpilih: function () {
      if (this.formDO.kodePaket === "" || !this.paketList) return null;

      let paket = this.paketList.find((p) => p.kode === this.formDO.kodePaket);

      // Jika paket dan data stok tersedia, gabungkan datanya
      if (paket && this.stokList) {
        let isiLengkap = paket.isi.map((kodeBuku) => {
          let bukuAsli = this.stokList.find((b) => b.kode === kodeBuku);
          return {
            kode: kodeBuku,
            judul: bukuAsli ? bukuAsli.judul : "Judul Tidak Ditemukan",
            inisial: kodeBuku.substring(0, 2),
          };
        });

        return { ...paket, isiLengkap: isiLengkap };
      }
      return paket;
    },
  },

  //Watch kalkulasi total harga otomatis saat paket dipilih
  watch: {
    "formDO.kodePaket": function (kodeTerpilih) {
      if (kodeTerpilih !== "") {
        let paketDitemukan = this.paketList.find(
          (p) => p.kode === kodeTerpilih,
        );
        if (paketDitemukan) {
          this.formDO.totalHarga = paketDitemukan.harga;
        }
      } else {
        this.formDO.totalHarga = 0;
      }
    },
  },

  //Format Tanggal dan Format Currency
  filters: {
    //Format Tanggal
    formatTanggalIndo: function (nilai) {
      if (!nilai) return "";
      const opsi = { day: "numeric", month: "long", year: "numeric" };
      return new Date(nilai).toLocaleDateString("id-ID", opsi);
    },

    formatRupiah: function (nilai) {
      return "Rp " + Number(nilai).toLocaleString("id-ID");
    },
  },

  //Methods Pencarian Enter atau Esc Keyboard
  methods: {
    //Fitur Pencarian Enter/Esc
    terapkanPencarian: function () {
      this.searchQuery = this.inputPencarian;
    },

    resetPencarian: function () {
      this.inputPencarian = "";
      this.searchQuery = "";
    },

    //Fitur Tambah Modal DO
    bukaModalTambah: function () {
      let tahun = new Date().getFullYear();
      let jumlahData = this.trackingData ? this.trackingData.length + 1 : 1;
      let urutan = String(jumlahData).padStart(4, "0"); // PadStart 4 digit mengikuti JSON
      let hariIni = new Date().toISOString().split("T")[0];

      this.formDO.noDO = "DO" + tahun + "-" + urutan;
      this.formDO.tanggalKirim = hariIni;
      this.showModalTambah = true;
    },

    simpanDO: function () {
      this.showModalTambah = false;
      this.isProcessing = true;

      setTimeout(() => {
        this.isProcessing = false;
        this.isSuccess = true;

        //Struktur Data Baru
        let objekBaru = {};
        objekBaru[this.formDO.noDO] = {
          nim: this.formDO.nim,
          nama: this.formDO.nama,
          status: "Proses Gudang",
          ekspedisi: this.formDO.pengiriman,
          tanggalKirim: this.formDO.tanggalKirim,
          paket: this.formDO.kodePaket,
          total: this.formDO.totalHarga,
          perjalanan: [
            {
              waktu: new Date().toLocaleString("id-ID"),
              keterangan: "DO Dibuat. Menunggu diproses oleh gudang.",
            },
          ],
        };

        //Masuk Array Utama
        this.trackingData.push(objekBaru);

        //Reset Form
        this.formDO = {
          noDO: "",
          nim: "",
          nama: "",
          kodePaket: "",
          pengiriman: "",
          tanggalKirim: "",
          totalHarga: 0,
        };

        setTimeout(() => {
          this.isSuccess = false;
        }, 1500);
      }, 1500);
    },

    //Fitur Baru ditugas 3 Update Progress Tracking
    bukaModalProgress: function (itemDO) {
      this.doTerpilih = itemDO;
      this.formProgress.statusBaru = itemDO.status; // Default ke status saat ini
      this.formProgress.keterangan = "";
      this.showModalProgress = true;
    },

    simpanProgress: function () {
      this.showModalProgress = false;
      this.isProcessing = true;

      setTimeout(() => {
        this.isProcessing = false;
        this.isSuccess = true;

        let noDO = this.doTerpilih.noDO;

        let targetRef = this.trackingData.find(
          (obj) => Object.keys(obj)[0] === noDO,
        );

        if (targetRef) {
          //Tambah Keterangan Waktu ke timeline Perjalanan

          targetRef[noDO].perjalanan.push({
            waktu: new Date().toLocaleString("id-ID"), // Waktu lokal otomatis
            keterangan: this.formProgress.keterangan,
          });

          targetRef[noDO].status = this.formProgress.statusBaru;
        }

        setTimeout(() => {
          this.isSuccess = false;
        }, 1500);
      }, 1500);
    },
  },
});
