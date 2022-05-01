const from = 1051;
const to = 1196;

describe('Download necro', () => {
  let content = [];

  for (let i = from; i <= to; i++) {

    it('download page ' + i, async () => {
      cy.visit('https://www.wuxiaworld.com/novel/necropolis-immortal/necro-chapter-' + i);
      return cy.get("#chapter-page").then(element => {
        content.push({
          title: element.find("h4").html(),
          spoilerTitle: element.find("h4.text-spoiler").html(),
          content: element.find(".chapter-content").html(),
        })
      })
    })
  }

  after(() => {
    const serializedContent = content.map((item) => {
        if (item.spoilerTitle) {
          return `<h1>Spoiler Title</h1>${item.content}<p>${item.title}</p>`;
        }
      return `<h1>${item.title}</h1>${item.content}`;
      }
    ).join("\n");
    return cy.writeFile(`books/necro-${from}-${to}.html`, serializedContent);
  })
});
