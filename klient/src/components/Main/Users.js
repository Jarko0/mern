import User from "./User";

const Users = (props) => {
    const users = props.users;
    return (
        <ul>
            {users.map((user) => (
                <User key={user._id} user={user} />
            ))}
        </ul>
    );
};

export default Users;
