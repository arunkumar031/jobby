import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'

import {FaStar, FaExternalLinkAlt} from 'react-icons/fa'
import {MdLocationOn} from 'react-icons/md'
import {BsBriefcaseFill} from 'react-icons/bs'

import Header from '../Header'

import './index.css'

class JobItemDetails extends Component {
  state = {
    apiStatus: 'INITIAL',
    jobDetails: {},
    similarJobs: [],
    lifeAtCompany: {},
    skills: [],
  }

  componentDidMount() {
    this.getData()
  }

  getData = async () => {
    this.setState({
      apiStatus: 'IN_PROGRESS',
    })
    const {match} = this.props
    const {params} = match
    const {id} = params
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs/${id}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()

    console.log(response)
    console.log(data)

    if (response.ok) {
      const updateJobDetails = {
        companyLogoUrl: data.job_details.company_logo_url,
        companyWebsiteUrl: data.job_details.company_website_url,
        employmentType: data.job_details.employment_type,
        id: data.job_details.id,
        jobDescription: data.job_details.job_description,
        skills: data.job_details.skills.map(each => ({
          imageUrl: each.image_url,
          name: each.name,
        })),
        lifeAtCompany: {
          description: data.job_details.life_at_company.description,
          imageUrl: data.job_details.life_at_company.image_url,
        },
        location: data.job_details.location,
        packagePerAnnum: data.job_details.package_per_annum,
        rating: data.job_details.rating,
        title: data.job_details.title,
      }

      const updateSimilarJobs = data.similar_jobs.map(each => ({
        companyLogoUrl: each.company_logo_url,
        employmentType: each.employment_type,
        id: each.id,
        jobDescription: each.job_description,
        location: each.location,
        rating: each.rating,
        title: each.title,
      }))

      this.setState({
        apiStatus: 'SUCCESS',
        jobDetails: updateJobDetails,
        similarJobs: updateSimilarJobs,
      })
    } else {
      this.setState({
        apiStatus: 'FAILURE',
      })
    }
  }

  onAppsRetry = () => {
    this.getData()
  }

  renderJobDetails = () => {
    const {jobDetails} = this.state
    const {lifeAtCompany, skills} = {...jobDetails}
    console.log(skills)

    return (
      <div>
        <div>
          <img src={jobDetails.companyLogoUrl} alt='job details company logo' />
          <div>
            <h1>{jobDetails.title}</h1>
            <div>
              <FaStar />
              <p>{jobDetails.rating}</p>
            </div>
          </div>
        </div>
        <div>
          <div>
            <div>
              <MdLocationOn />
              <p>{jobDetails.location}</p>
            </div>
            <div>
              <BsBriefcaseFill />
              <p>{jobDetails.employmentType}</p>
            </div>
          </div>
          <p>{jobDetails.packagePerAnnum}</p>
        </div>
        <hr />
        <div>
          <div>
            <h1>Description</h1>
            <a href={jobDetails.companyWebsiteUrl} target='_blank'>
              Visit <FaExternalLinkAlt />
            </a>
          </div>
          <p>{jobDetails.jobDescription}</p>
        </div>
        <div>
          <h1>Skills</h1>
          <ul>
            {skills.map(each => (
              <li key={skills.indexOf(each)}>
                <img src={each.imageUrl} alt={each.name} />
                <p>{each.name}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h1>Life at Company</h1>
          <div>
            <p>{lifeAtCompany.description}</p>
            <img src={lifeAtCompany.imageUrl} alt='life at company' />
          </div>
        </div>
      </div>
    )
  }

  renderSimilarJobs = () => {
    const {similarJobs} = this.state

    return (
      <div>
        <h1>Similar Jobs</h1>
        <ul>
          {similarJobs.map(each => (
            <li key={each.id}>
              <div>
                <img src={each.companyLogoUrl} alt='similar job company logo' />
                <div>
                  <h1>{each.title}</h1>
                  <div>
                    <FaStar />
                    <p>{each.rating}</p>
                  </div>
                </div>
                <div>
                  <h1>Description</h1>
                  <p>{each.jobDescription}</p>
                </div>
                <div>
                  <div>
                    <MdLocationOn />
                    <p>{each.location}</p>
                  </div>
                  <div>
                    <BsBriefcaseFill />
                    <p>{each.employmentType}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  renderLoader = () => (
    <div className='loader-container' data-testid='loader'>
      <Loader type='ThreeDots' color='#ffffff' height='50' width='50' />
    </div>
  )

  renderJobsFailure = () => (
    <div>
      <img
        src='https://assets.ccbp.in/frontend/react-js/failure-img.png '
        alt='failure view'
      />
      <div>
        <h1>Oops! Something Went Wrong</h1>
        <p>We cannot seem to find the page you are looking for.</p>
        <button type='button' onClick={this.onAppsRetry}>
          Retry
        </button>
      </div>
    </div>
  )

  renderFinalView = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case 'IN_PROGRESS':
        return this.renderLoader()
      case 'SUCCESS':
        return (
          <>
            {this.renderJobDetails()}
            {this.renderSimilarJobs()}
          </>
        )
      case 'FAILURE':
        return this.renderJobsFailure()
      default:
        return null
    }
  }

  render() {
    return (
      <div>
        <Header />
        {this.renderFinalView()}
      </div>
    )
  }
}

export default JobItemDetails
