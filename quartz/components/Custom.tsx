import { QuartzComponentConstructor } from "./types"

const Custom: QuartzComponentConstructor = () => {
  return () => (
    <div class="explorer-item">
      <a href="/" className="home-link">О проекте</a>
    </div>
  )
}

export default Custom