import React, { Component } from "react";
import {
    Button,
    Form,
    Alert
} from "react-bootstrap";
import { Container, Divider } from '@material-ui/core';
import { connect } from "react-redux";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
// const { ipcRenderer } = window.require("electron");

const useStyles = {
  root: {
    marginTop: '5rem',
  },
  buttonStyle: {
      minWidth: '10rem'
  }
};


class Profile extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        this.state = {
            stopLoss: 1.25,
            leverage: 15,
            showSuccess: false,
            showAlert: false,
            isOn: false,
            errMsg: ''
        }
    }

    componentDidMount() {
        this._isMounted = true;

        // ipcRenderer.send('fetch-text-from-storage', ['bybit_stop_loss', 'bybit_leverage'])
        // ipcRenderer.on('handle-fetch-text-from-storage', this.handleFetchText.bind(this));
        // ipcRenderer.on('handle-save-text-in-storage', this.handleSaveText.bind(this));

    }

    componentWillUnmount() {
        this._isMounted = false;
        // ipcRenderer.removeListener('handle-save-text-in-storage', this.handleSaveText.bind(this));
    }


    render() {
        const { user } = this.props;

        return (
            <>
                <Container maxWidth="sm" style={useStyles.root}>

                    <Form>
                      <Form.Group controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="email" value={user.email} placeholder="Enter your username" disabled/>
                      </Form.Group>

                      <Form.Group controlId="Name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" value={user.username} placeholder="Enter your name" disabled/>
                      </Form.Group>

                      <Form.Group controlId="companyInfo">
                        <Form.Label>Company Info.</Form.Label>
                        <Form.Control type="text" value="" disabled/>
                      </Form.Group>

                      {/* <Button variant="primary" type="submit" style={useStyles.buttonStyle}>
                        Update
                      </Button> */}
                    </Form>
                </Container>
            </>
        );
    }
}

const mapStateToProps = ({ auth: { user } }) => ({
  user
});

export default connect(mapStateToProps)(Profile);
