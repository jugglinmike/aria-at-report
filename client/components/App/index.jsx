import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import { renderRoutes } from 'react-router-config';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { handleCheckLoggedIn, handleLogout } from '../../actions/login';
import { getAllUsers } from '../../actions/users';
import { handleGetValidAts } from '../../actions/ats';

class App extends Component {
    constructor(props) {
        super(props);

        this.logout = this.logout.bind(this);
    }
    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(handleCheckLoggedIn());
        dispatch(handleGetValidAts());
        dispatch(getAllUsers());
    }

    logout() {
        const { dispatch } = this.props;
        dispatch(handleLogout());
    }

    render() {
        const { route, isLoggedIn, isAdmin, isTester } = this.props;
        return (
            <Fragment>
                <Container fluid>
                    <Navbar bg="light" expand="lg">
                        <Navbar.Brand as={Link} to="/">
                            <h1>ARIA-AT Report</h1>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse
                            id="basic-navbar-nav"
                            className="justify-content-end"
                        >
                            {(!isLoggedIn && (
                                <React.Fragment>
                                    <Nav.Link as={Link} to="/login">
                                        Login
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/signup">
                                        Sign Up
                                    </Nav.Link>
                                </React.Fragment>
                            )) || (
                                <React.Fragment>
                                    {isAdmin && (
                                        <Nav.Link as={Link} to="/cycles">
                                            Test Management
                                        </Nav.Link>
                                    )}
                                    {isTester && (
                                        <Nav.Link as={Link} to="/test-queue">
                                            Test Queue
                                        </Nav.Link>
                                    )}
                                    <Nav.Link as={Link} to="/account/settings">
                                        Settings
                                    </Nav.Link>
                                    <Nav.Link
                                        as={Link}
                                        to="/"
                                        onClick={this.logout}
                                    >
                                        Logout
                                    </Nav.Link>
                                </React.Fragment>
                            )}
                        </Navbar.Collapse>
                    </Navbar>
                </Container>
                <Container as="main" fluid>
                    {renderRoutes(route.routes)}
                </Container>
            </Fragment>
        );
    }
}

App.propTypes = {
    dispatch: PropTypes.func,
    isLoggedIn: PropTypes.bool,
    isAdmin: PropTypes.bool,
    isTester: PropTypes.bool,
    location: PropTypes.object,
    route: PropTypes.object
};

const mapStateToProps = state => {
    const { isLoggedIn, roles } = state.login;
    let isAdmin = roles ? roles.includes('admin') : false;
    let isTester = isAdmin || (roles && roles.includes('tester'));
    return { isLoggedIn, isAdmin, isTester };
};

export default connect(mapStateToProps)(App);
