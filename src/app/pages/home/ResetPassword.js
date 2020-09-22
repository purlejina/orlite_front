import React, { Component } from "react";
import {
    Button,
    Form,
    Alert
} from "react-bootstrap";
import { Container } from '@material-ui/core';
import API from '../../service/api';

// const { ipcRenderer } = window.require("electron");


const useStyles = {
  root: {
    marginTop: '5rem',
  },
  buttonStyle: {
      minWidth: '10rem'
  }
};

export default class ResetPassword extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        this.state = {
          input: {},
          errors: {},
          input: {
            currentpw: '',
            newpw: '',
            confirmpw: ''
          },
          showSuccess: false
        }

        this.handleChange = this.handleChange.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleSubmit = event => {
      event.preventDefault();

      let input = {};

      if(this.validate()){
        let data = {
          currentpw: this.state.input.currentpw,
          newpw: this.state.input.newpw
        }
        
        API.checkCurrentPW(data).then(results => {
          let errors = {};
          if(!results.data) {
            errors["currentpw"] = "The current password is invalid";
            this.setState({
              errors: errors
            });
          }else{
            this.setState({showSuccess: true});
          }
        });
  
        input["currentpw"] = "";
        input["newpw"] = "";
        input["confirmpw"] = "";
        this.setState({input:input});
      }

    }

    handleChange(event) {

      let input = this.state.input;
  
      input[event.target.name] = event.target.value.trim();
  
      this.setState({
        input
      });
    }

    validate(){
      let input = this.state.input;
      let errors = {};
      let isValid = true;
  
      if (!input["currentpw"]) {
        isValid = false;
        errors["currentpw"] = "Please enter the current password.";
      }
  
      if (!input["newpw"]) {
        isValid = false;
        errors["newpw"] = "Please enter your password.";
      }
  
      if (!input["confirmpw"]) {
        isValid = false;
        errors["confirmpw"] = "Please enter the confirm password.";
      }
  
      if (typeof input["newpw"] !== "undefined" && typeof input["confirmpw"] !== "undefined") {
        if (input["newpw"] != input["confirmpw"]) {
          isValid = false;
          errors["confirmpw"] = "Passwords don't match.";
        }
      } 
  
      this.setState({
        errors: errors
      });
  
      return isValid;
  }

    render() {
        return (
            <>
              <Container maxWidth="sm" style={useStyles.root}>
                  <Alert variant="primary" fade="true" show={this.state.showSuccess} onClose={() => this.setState({ showSuccess: false })} dismissible>
                    Password udpated successfully.
                  </Alert>
                  <Form onSubmit={this.handleSubmit}>
                    <Form.Group controlId="currentPass">
                      <Form.Label>Currrent Password</Form.Label>
                      <Form.Control type="password" name="currentpw" value={this.state.input.currentpw} placeholder="Current password" onChange={this.handleChange} />
                      <Form.Text className="text-danger">
                        {this.state.errors.currentpw}
                      </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="newPass">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control type="password" name="newpw" value={this.state.input.newpw} placeholder="New password" onChange={this.handleChange} />
                      <Form.Text className="text-danger">
                        {this.state.errors.newpw}
                      </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="confirmPass">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control type="password" value={this.state.input.confirmpw} name="confirmpw" placeholder="Confirm password" onChange={this.handleChange} />
                      <Form.Text className="text-danger">
                        {this.state.errors.confirmpw}
                      </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit" style={useStyles.buttonStyle}>
                      Submit
                    </Button>
                  </Form>
              </Container>
            </>
        );
    }
}
