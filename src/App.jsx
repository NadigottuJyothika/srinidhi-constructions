import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  House,
  Menu,
  PencilRuler,
  RefreshCw,
  X,
} from 'lucide-react'
import Admin from './Admin'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/index.php').replace(/\/+$/, '')

const serviceIcons = [House, Building2, PencilRuler, RefreshCw]

function Reveal({ children, className = '', delay = 0 }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduceMotion ? 0 : 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function App() {
  if (window.location.pathname.startsWith('/admin')) return <Admin />
  return <PublicSite />
}

function PublicSite() {
  const reduceMotion = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [services, setServices] = useState([])
  const [projectsError, setProjectsError] = useState('')
  const [servicesError, setServicesError] = useState('')
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(true)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')

  useEffect(() => {
    const loadCollection = async (resource, setItems, setError, setLoading) => {
      try {
        const response = await fetch(`${API}/${resource}`)
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || `Unable to load ${resource}.`)
        if (!Array.isArray(result.data)) throw new Error(`The ${resource} response was not valid.`)
        setItems(result.data)
      } catch (error) {
        setError(error.message || `Unable to load ${resource}.`)
      } finally {
        setLoading(false)
      }
    }

    loadCollection('projects', setProjects, setProjectsError, setProjectsLoading)
    loadCollection('services', setServices, setServicesError, setServicesLoading)
  }, [])

  const scrollTo = (id) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const submitEnquiry = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setEnquiryError('')

    try {
      const form = event.currentTarget
      const formData = new FormData(form)
      const response = await fetch(`${API}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Unable to send your enquiry. Please try again.')
      if (!Number.isInteger(result.data?.id)) throw new Error('The server did not confirm that your enquiry was saved.')
      setSubmitted(true)
      form.reset()
    } catch (error) {
      setEnquiryError(error.message || 'Unable to send your enquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const visibleProjects = showAllProjects ? projects : projects.slice(0, 3)

  return (
    <div className="site-shell">
      <header className={`site-header${menuOpen ? ' menu-is-open' : ''}`}>
        <a className="brand" href="#home" onClick={() => setMenuOpen(false)} aria-label="Srinidhi Constructions home">
          <span className="brand-mark">S</span>
          <span className="brand-name">Srinidhi <em>Constructions</em></span>
        </a>
        <nav className={`primary-nav${menuOpen ? ' is-open' : ''}`} id="mobile-navigation" aria-label="Main navigation">
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#about-story" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>Get in touch <ArrowUpRight size={14} /></a>
        </nav>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main>
        <section className="hero" id="home" aria-labelledby="hero-heading">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=85"
            alt="Modern home with a warm stone facade opening onto a landscaped courtyard"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <Reveal>
              <p className="eyebrow hero-eyebrow"><span /> Architecture · Design · Construction</p>
              <h1 id="hero-heading">Spaces designed<br />to inspire. <i>Built to last.</i></h1>
              <p className="hero-intro">Srinidhi Constructions brings thoughtful planning and considered craft to the places where life unfolds.</p>
              <div className="hero-actions">
                <a className="button button-light" href="#projects">Explore our projects <ArrowRight size={16} /></a>
                <a className="hero-secondary" href="#contact">Start your project <ArrowUpRight size={15} /></a>
              </div>
            </Reveal>
          </div>
          <a className="scroll-cue" href="#projects" aria-label="Scroll to featured projects"><span>Scroll to discover</span><ArrowDown size={14} /></a>
          <span className="hero-index">Bengaluru</span>
        </section>

        <section className="intro-band" id="about">
          <Reveal className="intro-inner">
            <p className="eyebrow"><span /> A more considered way to build</p>
            <div className="intro-copy">
              <h2>Good spaces make<br />room for <i>living.</i></h2>
              <div className="intro-aside">
                <p>We create homes and spaces that feel inevitable: well considered, beautifully made, and designed for the life within. From the first conversation to the final finish, we believe in clear thinking and care at every scale.</p>
                <a className="text-link" href="#about-story">Meet Srinidhi <ArrowUpRight size={15} /></a>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="projects-section section-wrap" id="projects" aria-labelledby="projects-heading">
          <Reveal className="section-heading">
            <div><p className="eyebrow"><span /> Selected work</p><h2 id="projects-heading">Built with <i>intention.</i></h2></div>
            <p className="section-note">A selection of projects shaped by place, purpose, and the people who call them their own.</p>
          </Reveal>
          {projectsError ? (
            <div className="data-message" role="status">{projectsError}</div>
          ) : projectsLoading ? (
            <div className="data-message" role="status">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="data-message" role="status">No projects are available at the moment.</div>
          ) : (
            <div className="project-grid" id="project-list">
              {visibleProjects.map((project, index) => (
                <Reveal className={`project-card${index === 0 ? ' project-featured' : ''}`} key={project.id} delay={index % 2 ? 0.08 : 0}>
                  <a className="project-link" href="#contact" aria-label={`Discuss a project like ${project.title}`}>
                    <div className="project-image">
                      {project.cover_image && <img src={project.cover_image} alt={`${project.title}, ${project.category} project`} loading="lazy" />}
                      <span className="project-image-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="project-image-arrow"><ArrowUpRight size={18} /></span>
                    </div>
                    <div className="project-details">
                      <div><p className="project-category">{project.category}{project.description?.startsWith('Illustrative') ? '' : project.status ? ` / ${project.status}` : ''}</p><h3>{project.title}</h3>{project.description?.startsWith('Illustrative') && <span className="project-demo-label">Illustrative concept · not a verified commission</span>}</div>
                      <span className="project-location">{project.location}</span>
                    </div>
                    {project.description && <p className="project-description">{project.description}</p>}
                  </a>
                </Reveal>
              ))}
            </div>
          )}
          {!projectsError && !projectsLoading && projects.length > 0 && (
            <div className="section-action">
              <button className="button button-outline" type="button" onClick={() => projects.length > 3 ? setShowAllProjects(!showAllProjects) : scrollTo('project-list')}>
                {projects.length > 3 && showAllProjects ? 'Show featured projects' : 'View all projects'} <ArrowUpRight size={15} />
              </button>
            </div>
          )}
        </section>

        <section className="services-section" id="services" aria-labelledby="services-heading">
          <div className="section-wrap services-inner">
            <Reveal className="services-heading">
              <div><p className="eyebrow"><span /> What we do</p><h2 id="services-heading">From first line<br />to <i>final finish.</i></h2></div>
              <p>Considered work, from the earliest plan through to the last detail.</p>
            </Reveal>
            {servicesError ? (
              <div className="data-message data-message-dark" role="status">{servicesError}</div>
            ) : servicesLoading ? (
              <div className="data-message data-message-dark" role="status">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="data-message data-message-dark" role="status">No services are available at the moment.</div>
            ) : (
              <div className="service-list">
                {services.map((service, index) => {
                  const Icon = serviceIcons[index % serviceIcons.length]
                  return (
                    <Reveal className="service-row" key={service.id} delay={index * 0.04}>
                      <span className="service-number">{String(index + 1).padStart(2, '0')}</span>
                      <Icon className="service-icon" size={21} strokeWidth={1.35} aria-hidden="true" />
                      <h3>{service.title}</h3>
                      <div className="service-description"><p>{service.description}</p>{service.description?.startsWith('Illustrative service scope only;') && <span>Illustrative scope · availability unconfirmed</span>}</div>
                      <ArrowDownRight className="service-arrow" size={18} aria-hidden="true" />
                    </Reveal>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <section className="about-section section-wrap" id="about-story" aria-labelledby="about-heading">
          <Reveal className="about-photo-wrap">
            <img className="about-photo" src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=82" alt="Quiet contemporary interior with natural materials and carefully framed light" loading="lazy" />
            <span className="photo-caption">Considered in every detail</span>
          </Reveal>
          <Reveal className="about-copy" delay={0.08}>
            <p className="eyebrow"><span /> About Srinidhi</p>
            <h2 id="about-heading">A building is more than its <i>materials.</i></h2>
            <p>It is the way morning light moves through a room, the ease of a well-planned space, and the feeling of being somewhere that simply works.</p>
            <p>We bring a calm, transparent process and a sharp eye for detail to every project, creating places that become part of your story.</p>
            <div className="about-proof"><strong>{projects.length}</strong><span>projects in our portfolio</span></div>
            <a className="text-link" href="#contact">Tell us what you have in mind <ArrowUpRight size={15} /></a>
          </Reveal>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-heading">
          <div className="section-wrap contact-inner">
            <Reveal className="contact-copy">
              <p className="eyebrow"><span /> Your project begins here</p>
              <h2 id="contact-heading">Let’s make<br /><i>room for it.</i></h2>
              <p className="contact-intro">Tell us a little about what you are building. We will be in touch within two working days.</p>
              <div className="contact-links">
                <a href="mailto:hello@srinidhiconstructions.in">hello@srinidhiconstructions.in <ArrowUpRight size={14} /></a>
                <a href="tel:+918012345678">+91 80 1234 5678 <ArrowUpRight size={14} /></a>
              </div>
            </Reveal>
            <Reveal className="contact-form-wrap" delay={0.08}>
              {submitted ? (
                <div className="success-message" role="status" aria-live="polite">
                  <span className="success-icon"><Check size={20} /></span>
                  <p className="eyebrow">Enquiry received</p>
                  <h3>Thank you for reaching out.</h3>
                  <p>We have your note and will be in touch shortly.</p>
                  <button type="button" className="text-link" onClick={() => { setSubmitted(false); setEnquiryError('') }}>Send another enquiry <ArrowUpRight size={15} /></button>
                </div>
              ) : (
                <form className="enquiry-form" onSubmit={submitEnquiry}>
                  <div className="form-row">
                    <label>Your name<input name="name" autoComplete="name" required maxLength="120" placeholder="e.g. Ananya Rao" /></label>
                    <label>Email address<input name="email" type="email" autoComplete="email" required maxLength="190" placeholder="you@company.com" /></label>
                  </div>
                  <div className="form-row">
                    <label>Phone number <span>Optional</span><input name="phone" type="tel" autoComplete="tel" maxLength="40" placeholder="+91" /></label>
                    <label>Subject <span>Optional</span><input name="subject" maxLength="180" placeholder="What are you planning?" /></label>
                  </div>
                  <label>Tell us about your project<textarea name="message" required rows="4" placeholder="A home, a workspace, a thought..." /></label>
                  {enquiryError && <p className="contact-error" role="alert">{enquiryError}</p>}
                  <button className="button button-bronze" type="submit" disabled={submitting}>
                    {submitting ? 'Sending enquiry...' : 'Send enquiry'} <ArrowUpRight size={16} />
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="section-wrap footer-main">
          <div className="footer-brand-block">
            <a className="brand footer-brand" href="#home"><span className="brand-mark">S</span><span className="brand-name">Srinidhi <em>Constructions</em></span></a>
            <p>Thoughtful construction<br />for considered living.</p>
          </div>
          <div className="footer-column"><span className="footer-label">Explore</span><a href="#projects">Projects</a><a href="#services">Services</a><a href="#about-story">About us</a></div>
          <div className="footer-column"><span className="footer-label">Start a conversation</span><a href="mailto:hello@srinidhiconstructions.in">hello@srinidhiconstructions.in</a><a href="tel:+918012345678">+91 80 1234 5678</a><a href="#contact">Enquire about a project <ArrowUpRight size={13} /></a></div>
        </div>
        <div className="section-wrap footer-bottom"><span>© 2026 Srinidhi Constructions</span><a href="#home">Back to top <ArrowUpRight size={13} /></a></div>
      </footer>
      <AnimatePresence>
        {menuOpen && <motion.div className="mobile-nav-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      </AnimatePresence>
    </div>
  )
}

export default App