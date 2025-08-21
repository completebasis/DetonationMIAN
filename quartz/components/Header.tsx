import { QuartzComponent, QuartzComponentConstructor } from "./types"

const Header: QuartzComponent = () => {
  return (
    <header>
      <img src="/static/img/header.jpg" alt="Site Header" className="header-img" />
    </header>
  )
}

Header.css = `
header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 2rem 0;
  gap: 1.5rem;
}
.header-img {
  height: 80px;
}
`

export default (() => Header) satisfies QuartzComponentConstructor