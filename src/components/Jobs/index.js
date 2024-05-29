import {Component} from 'react'
import Cookies from 'js-cookie'
import {BsSearch} from 'react-icons/bs'
import Loader from 'react-loader-spinner'

import Header from '../Header'
import JobItem from '../JobItem'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

class Jobs extends Component {
  state = {
    profileApiStatus: 'INITIAL',
    appsApiStatus: 'INITIAL',
    searchInput: '',
    searchText: '',
    salaryRange: '',
    employmentType: '',
    employmentList: [],
    appsList: [],
    profileData: {},
  }

  componentDidMount() {
    this.getProfileData()
    this.getAppsData()
  }

  getProfileData = async () => {
    this.setState({profileApiStatus: 'IN_PROGRESS'})
    const apiUrl = 'https://apis.ccbp.in/profile'
    const jwtToken = Cookies.get('jwt_token')
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()

    if (response.ok) {
      const profileDetails = data.profile_details
      this.setState({
        profileData: {
          name: profileDetails.name,
          profileImgUrl: profileDetails.profile_image_url,
          shortBio: profileDetails.short_bio,
        },
        profileApiStatus: 'SUCCESS',
      })
    } else {
      this.setState({profileApiStatus: 'FAILURE'})
    }
  }

  onProfileRetry = () => {
    this.getProfileData()
  }

  getAppsData = async () => {
    this.setState({appsApiStatus: 'IN_PROGRESS'})
    const {searchInput, salaryRange, employmentList} = this.state
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentList.join()}&minimum_package=${salaryRange}&search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()

    if (response.ok) {
      const list = data.jobs.map(each => ({
        id: each.id,
        companyLogoUrl: each.company_logo_url,
        employmentType: each.employment_type,
        jobDescription: each.job_description,
        location: each.location,
        packagePerAnnum: each.package_per_annum,
        rating: each.rating,
        title: each.title,
      }))

      this.setState({appsList: [...list], appsApiStatus: 'SUCCESS'})
    } else {
      this.setState({appsApiStatus: 'FAILURE'})
    }
  }

  onAppsRetry = () => {
    this.getAppsData()
  }

  filterByEmployment = event => {
    if (event.target.checked === true) {
      this.setState(
        prevState => ({
          employmentList: [...prevState.employmentList, event.target.value],
        }),
        this.getAppsData,
      )
    } else {
      this.setState(
        prevState => ({
          employmentList: prevState.employmentList.filter(
            each => each !== event.target.value,
          ),
        }),
        this.getAppsData,
      )
    }
  }

  filterBySalary = event => {
    this.setState({salaryRange: event.target.value}, this.getAppsData)
  }

  filterBySearch = event => {
    this.setState({searchText: event.target.value})
  }

  onClickSearch = () => {
    const {searchText} = this.state
    this.setState({searchInput: searchText}, this.getAppsData)
  }

  renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderProfile = () => {
    const {profileData} = this.state
    return (
      <div>
        <img src={profileData.profileImgUrl} alt="profile" />
        <h1>{profileData.name}</h1>
        <p>{profileData.shortBio}</p>
      </div>
    )
  }

  renderProfileFailure = () => (
    <button type="button" onClick={this.onProfileRetry}>
      Retry
    </button>
  )

  renderProfileView = () => {
    const {profileApiStatus} = this.state
    switch (profileApiStatus) {
      case 'IN_PROGRESS':
        return this.renderLoader()
      case 'SUCCESS':
        return this.renderProfile()
      case 'FAILURE':
        return this.renderProfileFailure()
      default:
        return null
    }
  }

  renderProfileAndFilters = () => (
    <div>
      {this.renderProfileView()}
      <hr />
      <div>
        <h1>Type of Employment</h1>
        <ul>
          {employmentTypesList.map(each => (
            <li key={each.employmentTypeId}>
              <input
                type="checkbox"
                id={each.employmentTypeId}
                value={each.employmentTypeId}
                onClick={this.filterByEmployment}
              />
              <label htmlFor={each.employmentTypeId}>{each.label}</label>
            </li>
          ))}
        </ul>
      </div>
      <hr />
      <div>
        <h1>Salary Range</h1>
        <ul>
          {salaryRangesList.map(each => (
            <li key={each.salaryRangeId}>
              <input
                type="radio"
                id={each.salaryRangeId}
                value={each.salaryRangeId}
                name="salary"
                onClick={this.filterBySalary}
              />
              <label htmlFor={each.salaryRangeId}>{each.label}</label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  renderJobs = () => {
    const {appsList} = this.state
    if (appsList.length === 0) {
      return (
        <div>
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
          />
          <h1>No Jobs Found</h1>
          <p>We could not find any jobs. Try other filters.</p>
        </div>
      )
    }
    return (
      <ul>
        {appsList.map(each => (
          <JobItem key={each.id} jobDetails={each} />
        ))}
      </ul>
    )
  }

  renderJobsFailure = () => (
    <div>
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png "
        alt="failure view"
      />
      <div>
        <h1>Oops! Something Went Wrong</h1>
        <p>We cannot seem to find the page you are looking for.</p>
        <button type="button" onClick={this.onAppsRetry}>
          Retry
        </button>
      </div>
    </div>
  )

  renderJobsView = () => {
    const {appsApiStatus} = this.state
    switch (appsApiStatus) {
      case 'IN_PROGRESS':
        return this.renderLoader()
      case 'SUCCESS':
        return this.renderJobs()
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
        <div>
          {this.renderProfileAndFilters()}
          <div>
            <div>
              <input
                type="search"
                placeholder="Search"
                onChange={this.filterBySearch}
              />
              <button
                type="button"
                data-testid="searchButton"
                onClick={this.onClickSearch}
              >
                <BsSearch className="search-icon" />
              </button>
            </div>
            {this.renderJobsView()}
          </div>
        </div>
      </div>
    )
  }
}

export default Jobs

// {this.renderProfileAndFilters()}
// {this.renderJobs()}
