class User {
    constructor(name = null, lastName = null, email = null, password = null, phone = null, birthDate = null, gender = null, notifications = true) {
        this.name = name;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.birthDate = birthDate;
        this.gender = gender;
        this.notifications = notifications;
    }
}

export default User;
