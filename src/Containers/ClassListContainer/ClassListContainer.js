import React, { Component } from "react";
import "./ClassListContainer.scss";
import PrimaryButton from "./../../Components/Buttons/PrimaryButton";
import Axios from "axios";
import {NavLink} from 'react-router-dom'
import {connect} from 'react-redux'
import {updateCourseInfo} from './../../ducks/reducer'

class ClassListContainer extends Component {
  state = {
    courses: [],
    selectedCourse:''
  };

  componentDidMount = async () => {
    const cRes = await Axios.get(`/info/courses`);
    console.log(cRes);

    this.setState({ courses: cRes.data });
  };

  handleCourseSelection = (course) => {
    this.setState({
      selectedCourse:course
    },()=>this.props.updateCourseInfo(this.state.selectedCourse))
  }

  render() {
    const { courses } = this.state;
    const {handleCourseSelection} = this

    const courseMapper = courses.map(course => {
      return (
        <div key={course.course_id}>
          <h1 onClick={()=>handleCourseSelection(course)}>{course.title}</h1>
        </div>        
      );
    });
    return (
      <div className="listContainer">
          <NavLink to='/addCourse'><PrimaryButton>Add Course</PrimaryButton></NavLink>
        {courseMapper}
      </div>
    );
  }
}

export default connect(null,{updateCourseInfo})(ClassListContainer)