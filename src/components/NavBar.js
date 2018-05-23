import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'
import { withRouter } from 'react-router'

import { Link } from 'react-router-dom'
import Button from 'material-ui/Button'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'

import { setUser } from '../store/actions'
import API from './API'
import MdIcon from './MdIcon'
import FinanceSvg from 'mdi-svg/svg/finance.svg'
import LogsSvg from 'mdi-svg/svg/file-outline.svg'
import DuplicateSvg from 'mdi-svg/svg/content-duplicate.svg'
import LogoutSvg from 'mdi-svg/svg/logout.svg'

const styles = theme => {
  return {
    root: {
      backgroundColor: theme.palette.custom.greyLight,
      overflowX: 'hidden'
    },
    nav: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      height: '100%',
      width: '100%',
      padding: 0
    },
    list: {
      width: '100%'
    },
    menuItem: {
      fontSize: 14,
      padding: theme.spacing.unit
    },
    menuIcon: {
      fill: theme.palette.grey[600],
      marginLeft: theme.spacing.unit
    },
    menuItemIcon: {
      fill: theme.palette.grey[900],
      marginRight: theme.spacing.unit,
      width: 24,
      height: 24
    }
  }
}

const buttonStyles = theme => {
  return {
    root: {
      height: '100%',
      color: theme.palette.custom.greyLight,
      padding: theme.spacing.unit,
      textTransform: 'none',
      borderBottom: '2px solid transparent',
      borderRadius: 0,
      '&:hover': {
        color: theme.palette.common.white,
        borderBottom: '2px solid ' + theme.palette.custom.greyLight,
        backgroundColor: 'transparent'
      },
      '&:hover svg': {
        fill: theme.palette.grey[900]
      }
    }
  }
}
const StyledButton = withStyles(buttonStyles)(Button)

class NavBar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isLoading: true,
      isMenuOpen: false,
      anchorEl: null
    }
  }

  componentDidMount () {
    this.checkIfLoggedIn()
  }

  checkIfLoggedIn = async () => {
    // null = unknown, false = known to be false
    if (this.props.user.id === null) {
      try {
        const response = await API.get('/profile')
        this.props.setUser(response.data.user)
      } catch (e) {
        this.props.setUser({ id: false })
        // Not logged in
      }
    }
    this.setState({
      ...this.state,
      isLoading: false
    })
  }

  navTo = path => () => {
    this.props.history.push(path)
  }

  logout = async () => {
    this.closeMenu()
    try {
      await API.get('/logout')
    } catch (e) {
    }
    this.props.setUser({ id: null })
    this.props.history.push('/')
  }

  render () {
    const { classes, className } = this.props
    let userName = this.props.user.name || this.props.user.email || ''
    if (userName.length > 20) {
      userName = userName.slice(0, 20) + '…'
    }
    return (
      <div className={`${classes.root} ${className}`}>
        {
          this.state.isLoading && <div />
        }
        {
          !this.state.isLoading && this.props.user.id &&
          <div className={classes.nav}>
            <List className={classes.list} component='nav' dense>
              <ListItem button onClick={this.navTo('/report')}>
                <ListItemIcon>
                  <MdIcon svg={FinanceSvg} className={classes.menuItemIcon} />
                </ListItemIcon>
                <ListItemText primary='Reports' />
              </ListItem>
              <ListItem button onClick={this.navTo('/logs')}>
                <ListItemIcon>
                  <MdIcon svg={LogsSvg} className={classes.menuItemIcon} />
                </ListItemIcon>
                <ListItemText primary='Logs' />
              </ListItem>
              <ListItem button onClick={this.navTo('/legacy')}>
                <ListItemIcon>
                  <MdIcon svg={DuplicateSvg} className={classes.menuItemIcon} />
                </ListItemIcon>
                <ListItemText primary='Legacy' />
              </ListItem>
            </List>
            <List className={classes.list} component='nav' dense>
              <ListItem button onClick={this.logout}>
                <ListItemIcon>
                  <MdIcon svg={LogoutSvg} className={classes.menuItemIcon} />
                </ListItemIcon>
                <ListItemText primary='Logout' />
              </ListItem>
            </List>
          </div>
        }
        {
          !this.state.isLoading && !this.props.user.id &&
          <div>
            <StyledButton to='/login' component={Link}>
              Login
            </StyledButton>
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setUser (user) {
      dispatch(setUser(user))
    }
  }
}

const connectedNavBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBar)

export default withRouter(withStyles(styles)(connectedNavBar))
