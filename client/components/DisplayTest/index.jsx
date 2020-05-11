import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import './DisplayTest.css';
import { withRouter } from 'react-router-dom';
import {
    Button,
    ButtonGroup,
    ButtonToolbar,
    Col,
    Modal,
    Row
} from 'react-bootstrap';
import TestResult from '@components/TestResult';

class DisplayTest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showConfirmModal: false,
            buttonAction: ''
        };

        // Test run actions
        this.handleNextTestClick = this.handleNextTestClick.bind(this);
        this.handlePreviousTestClick = this.handlePreviousTestClick.bind(this);
        this.handleCloseRunClick = this.handleCloseRunClick.bind(this);
        this.handleRedoClick = this.handleRedoClick.bind(this);

        // Modal actions
        this.handleModalCloseClick = this.handleModalCloseClick.bind(this);
        this.handleModalConfirmClick = this.handleModalConfirmClick.bind(this);

        this.testIframe = React.createRef();
    }

    handleModalCloseClick() {
        this.setState({
            showConfirmModal: false
        });
    }

    handleModalConfirmClick() {
        this.setState({
            showConfirmModal: false
        });
        this.performButtonAction();
    }

    handleRedoClick() {
        this.setState({
            buttonAction: 'redoTest',
            showConfirmModal: true
        });
    }

    performButtonAction() {
        const {
            cycleId,
            history,
            displayNextTest,
            displayPreviousTest,
            deleteResultFromTest
        } = this.props;
        if (this.state.buttonAction === 'exitAfterConfirm') {
            history.push(`/test-queue/${cycleId}`);
        }
        if (this.state.buttonAction === 'goToNextTest') {
            displayNextTest();
        }
        if (this.state.buttonAction === 'goToPreviousTest') {
            displayPreviousTest();
        }
        if (this.state.buttonAction === 'redoTest') {
            if (!this.testHasResult) {
                document
                    .getElementById('test-iframe')
                    .contentWindow.location.reload();
                return;
            }
            deleteResultFromTest();
        }
    }

    handleNextTestClick() {
        this.setState({
            buttonAction: 'goToNextTest'
        });
        this.trySaving();
    }

    handlePreviousTestClick() {
        this.setState({
            buttonAction: 'goToPreviousTest'
        });
        this.trySaving();
    }

    handleCloseRunClick() {
        this.setState({
            buttonAction: 'exitAfterConfirm'
        });
        this.trySaving();
    }

    trySaving() {
        const { saveResultFromTest } = this.props;

        // Only to to save if results don't exist
        if (!this.testHasResult) {
            let resultsEl = this.testIframe.current.contentDocument.querySelector(
                '#__ariaatharness__results__'
            );

            if (!resultsEl) {
                this.setState({
                    showConfirmModal: true
                });
                return;
            }

            let result;
            try {
                result = JSON.parse(resultsEl.innerText);
            } catch (error) {
                console.error(
                    'Cannot save tests do to malformed information from test file.'
                );
                throw error;
            }

            saveResultFromTest(result);
        }

        // Save was successful
        this.performButtonAction();
    }

    renderModal() {
        let { testIndex } = this.props;

        let modalTitle, action;
        let cannotSave = `Test ${testIndex} has not been completed in full and your progress on this test won’t be saved.`;

        if (this.state.buttonAction === 'exitAfterConfirm') {
            modalTitle = 'Save and Close';
            action = `You are about to leave this test run. ${cannotSave}`;
        }
        if (this.state.buttonAction === 'goToNextTest') {
            modalTitle = 'Next Test';
            action = `You are about to move to the next test. ${cannotSave}`;
        }
        if (this.state.buttonAction === 'goToPreviousTest') {
            modalTitle = 'Previous Test';
            action = `You are about to move to the previous test. ${cannotSave}`;
        }
        if (this.state.buttonAction === 'redoTest') {
            modalTitle = 'Re-Do';
            action = `Are you sure you want to re-do test ${testIndex}. Your progress (if any) will be lost.`;
        }

        return (
            <Modal
                show={this.state.showConfirmModal}
                onHide={this.handleModalCloseClick}
                centered
                animation={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{action}</Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={this.handleModalCloseClick}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={this.handleModalConfirmClick}
                    >
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    render() {
        const { test, git_hash, at_key, testIndex } = this.props;

        this.testHasResult =
            test.result && test.result.status === 'complete' ? true : false;

        let testContent = null;
        let menuUnderContent = null;
        let menuRightOContent = null;

        menuUnderContent = (
            <ButtonToolbar className="testrun__button-toolbar--margin">
                {testIndex !== 1 && (
                    <Button
                        variant="primary"
                        onClick={this.handlePreviousTestClick}
                    >
                        Previous Test
                    </Button>
                )}
                <Button
                    className="testrun__button--right"
                    variant="primary"
                    onClick={this.handleNextTestClick}
                >
                    Next Test
                </Button>
            </ButtonToolbar>
        );
        menuRightOContent = (
            <ButtonGroup vertical>
                <Button
                    href="https://github.com/w3c/aria-at/issues"
                    variant="primary"
                >
                    Raise an issue
                </Button>
                <Button variant="primary" onClick={this.handleRedoClick}>
                    Re-do Test
                </Button>
                <Button variant="primary" onClick={this.handleCloseRunClick}>
                    {this.testHasResult ? 'Close' : 'Save and Close'}
                </Button>
            </ButtonGroup>
        );

        if (this.testHasResult) {
            testContent = <TestResult testResult={test.result} />;
        } else {
            testContent = (
                <iframe
                    src={`/aria-at/${git_hash}/${test.file}?at=${at_key}`}
                    id="test-iframe"
                    ref={this.testIframe}
                ></iframe>
            );
        }

        let modals = this.renderModal();

        return (
            <Fragment>
                <Col md={9}>
                    <Row>{testContent}</Row>
                    <Row>{menuUnderContent}</Row>
                </Col>
                <Col md={3}>{menuRightOContent}</Col>
                {modals}
            </Fragment>
        );
    }
}

DisplayTest.propTypes = {
    dispatch: PropTypes.func,
    test: PropTypes.object,
    testIndex: PropTypes.number,
    git_hash: PropTypes.string,
    at_key: PropTypes.string,
    cycleId: PropTypes.number,
    history: PropTypes.object,
    displayNextTest: PropTypes.func,
    displayPreviousTest: PropTypes.func,
    saveResultFromTest: PropTypes.func,
    deleteResultFromTest: PropTypes.func
};

export default withRouter(DisplayTest);