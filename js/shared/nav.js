export class Nav {
  constructor(pages) {
    this.pages = pages;

    this.state = {
      activePages: new Set(["p1"]),
    };

    this.navItems = d3
      .selectAll("a.nav-link")
      .on("click", this.swapPage.bind(this));
  }

  activatePage(pName) {
    this.pages[pName].show();
    this.state.activePages.add(pName);
    document.querySelector(`#${pName}`).classList.add("active");
  }

  hidePage(pName) {
    this.pages[pName].hide();
    this.state.activePages.delete(pName);
    document.querySelector(`#${pName}`).classList.remove("active");
  }

  swapPage(pElement) {
    if (
      !this.state.activePages.has(pElement.target.id) ||
      this.state.activePages.size != 1
    ) {
      this.state.activePages.forEach((pName) => {
        this.hidePage(pName);
      });

      this.activatePage(pElement.target.id);
    }
  }
}
