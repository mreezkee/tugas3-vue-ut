Vue.component("ba-stock-table", {
  template: "#tpl-stock",
  props: ["items", "upbjjList", "kategoriList"], // Mengambil data 'stok' dari app.js utama

  data: function () {
    return {
      // Filter & Watcher
      filterUpbjj: "",
      filterKategori: "",
      filterStatus: "",
      sortBy: "judul_asc",
      logAktivitas: "Siap memantau aktivitas filter...",

      // Variabel Modal & Form
      showModal: false,
      baruBuku: {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: null,
        qty: null,
        safety: null,
        catatanHTML: "",
      },
      isEditMode: false,
      kodeYangDiedit: null,
      isProcessing: false,
      isSuccess: false,
    };
  },

  // WATCHERS
  watch: {
    filterUpbjj: function (nilaiBaru) {
      this.filterKategori = ""; // Dependent dropdown reset
      if (nilaiBaru !== "") {
        this.logAktivitas = "Memilih UT Daerah: " + nilaiBaru;
      } else {
        this.logAktivitas = "Mereset UT Daerah";
      }
    },
    filterKategori: function (nilaiBaru) {
      if (nilaiBaru !== "")
        this.logAktivitas = "Menyaring Kategori: " + nilaiBaru;
    },
    filterStatus: function (nilaiBaru) {
      if (nilaiBaru !== "")
        this.logAktivitas = "Menyaring Status: " + nilaiBaru;
    },
  },

  // COMPUTED
  computed: {
    stokTersaring: function () {
      if (!this.items) return [];
      let dataHasil = [...this.items]; // Perubahan: Ambil dari this.items

      if (this.filterUpbjj !== "")
        dataHasil = dataHasil.filter((buku) => buku.upbjj === this.filterUpbjj);
      if (this.filterKategori !== "")
        dataHasil = dataHasil.filter(
          (buku) => buku.kategori === this.filterKategori,
        );

      if (this.filterStatus === "reorder") {
        dataHasil = dataHasil.filter(
          (buku) => buku.qty < buku.safety || buku.qty === 0,
        );
      } else if (this.filterStatus === "kosong") {
        dataHasil = dataHasil.filter((buku) => buku.qty === 0);
      } else if (this.filterStatus === "menipis") {
        dataHasil = dataHasil.filter(
          (buku) => buku.qty > 0 && buku.qty < buku.safety,
        );
      }

      dataHasil.sort((a, b) => {
        if (this.sortBy === "judul_asc") return a.judul.localeCompare(b.judul);
        if (this.sortBy === "judul_desc") return b.judul.localeCompare(a.judul);
        if (this.sortBy === "stok_asc") return a.qty - b.qty;
        if (this.sortBy === "stok_desc") return b.qty - a.qty;
        if (this.sortBy === "harga_asc") return a.harga - b.harga;
        if (this.sortBy === "harga_desc") return b.harga - a.harga;
      });

      return dataHasil;
    },
  },

  // TUGAS 3 FITUR BARU: Vue Filters untuk Text Formatting
  filters: {
    formatRupiah: function (value) {
      return "Rp " + Number(value).toLocaleString("id-ID");
    },
    formatSatuan: function (value) {
      return value + " buah";
    },
  },

  // Mounted untuk pantau tombol enter pada form input
  mounted: function () {
    window.addEventListener("keydown", this.pantauTombolEnter);
  },

  beforeDestroy: function () {
    window.removeEventListener("keydown", this.pantauTombolEnter);
  },

  // METHODS
  methods: {
    bukaModalEdit: function (buku) {
      this.isEditMode = true;
      this.kodeYangDiedit = buku.kode;
      this.baruBuku = { ...buku };
      this.showModal = true;
    },
    bukaModalTambah: function () {
      this.isEditMode = false;
      this.kodeYangDiedit = null;
      this.baruBuku = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: null,
        qty: null,
        safety: null,
        catatanHTML: "",
      };
      this.showModal = true;
    },
    tutupModal: function () {
      this.showModal = false;
    },
    resetFilter: function () {
      this.filterUpbjj = "";
      this.filterKategori = "";
      this.filterStatus = "";
      this.sortBy = "judul_asc";
    },

    //Method untuk pantau tombol enter pada form input
    pantauTombolEnter: function (event) {
      if (this.showModal && event.key === "Enter") {
        if (document.activeElement.tagName.toLowerCase() === "textarea") {
          return;
        }

        event.preventDefault(); // Mencegah browser melakukan aksi ganda
        this.cekValidasiDanSimpan(); // Panggil sistem penjaga gawang kita
      }
    },

    cekValidasiDanSimpan: function () {
      let form = this.$refs.formStok;
      if (form.checkValidity()) {
        this.simpanBuku();
      } else {
        form.reportValidity();
      }
    },

    simpanBuku: function () {
      this.showModal = false;
      this.isProcessing = true;

      setTimeout(() => {
        this.isProcessing = false;
        this.isSuccess = true;

        if (this.isEditMode === true) {
          let index = this.items.findIndex(
            (item) => item.kode === this.kodeYangDiedit,
          );
          if (index != -1) this.items.splice(index, 1, { ...this.baruBuku });
        } else {
          this.items.push({ ...this.baruBuku });
        }
        setTimeout(() => {
          this.isSuccess = false;
        }, 1500);
      }, 1500);
    },

    // TUGAS 3 FITUR BARU: Menghapus Data
    hapusBuku: function (kode) {
      if (confirm("Apakah Anda yakin ingin menghapus bahan ajar ini?")) {
        let index = this.items.findIndex((item) => item.kode === kode);
        if (index != -1) this.items.splice(index, 1);
      }
    },

    // Utilities: Membersihkan tag HTML agar rapi saat menjadi Tooltip Title
    stripHTML: function (html) {
      if (!html) return "";
      return html.replace(/<[^>]*>?/gm, "");
    },
  },
});
