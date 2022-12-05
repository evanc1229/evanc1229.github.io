export class Nav {
  constructor(pages) {
    this.pages = pages;
    this.activePage = "p1";

    this.state = {
      activePage: "p1",
      prevPage: null,
    };

    this.navItems = d3.selectAll("a.nav-link").on("click", this.swapPage.bind(this));
  }

  swapPage(p) {
    if (this.state.activePage != p.target.id) {
      this.state.prevPage = this.state.activePage;
      this.pages[this.state.activePage].hide();
      this.pages[p.target.id].show();
      this.state.activePage = p.target.id;

      document.querySelector(`#${this.state.prevPage}`).classList.remove("active");
      p.target.classList.add("active");
    }
  }
}
