import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import { connect } from "react-redux";
import { updateLike, deletePost } from "../../actions/post";
import { BsFillHeartFill } from "react-icons/bs";

const PostItem = ({
  updateLike,
  deletePost,
  auth,
  post: { _id, text, name, avatar, user, likes, comments, date },
  showActions,
}) => (
  <div className="post bg-white p-1 my-1">
    <div>
      <Link to={`/profile/${user}`}>
        <img className="round-img" src={avatar} alt="" />
        <h4>{name}</h4>
      </Link>
    </div>
    <div>
      <p className="my-1">{text}</p>
      <p className="post-date">
        Posted on <Moment format="YYYY/MM/DD">{date}</Moment>
      </p>

      {showActions && (
        <Fragment>
          <button
            type="button"
            className="btn btn-dark"
            onClick={() => updateLike(_id)}
          >
            {!auth.loading
              ? (console.log(likes.map((like) => like.user.toString())),
                console.log(auth.user._id),
                console.log(
                  likes.length > 0 &&
                    likes
                      .map((like) => like.user.toString())
                      .includes(auth.user._id)
                ))
              : console.log("HI")}
            <Fragment>
              {likes.length > 0 &&
              !auth.loading &&
              likes
                .map((like) => like.user.toString())
                .includes(auth.user._id) ? (
                <BsFillHeartFill
                  color="#f44336"
                  size="25px"
                  style={{ margin: "0 5px" }}
                />
              ) : (
                <BsFillHeartFill
                  color="#FFFFFF"
                  size="25px"
                  style={{ margin: "0 5px" }}
                />
              )}
            </Fragment>{" "}
            {likes.length > 0 && <span>{likes.length}</span>}
          </button>
          <Link to={`/posts/${_id}`} className="btn btn-primary">
            Discussion{" "}
            {comments.length > 0 && (
              <span className="comment-count">{comments.length}</span>
            )}
          </Link>

          {!auth.loading && user === auth.user._id && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => deletePost(_id)}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </Fragment>
      )}
    </div>
  </div>
);

PostItem.defaultProps = {
  showActions: true,
};

PostItem.propTypes = {
  post: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  updateLike: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { updateLike, deletePost })(PostItem);
