class User {
    constructor(name = null, lastName = null, email = null, password = null, phone = null, birthDate = null, gender = null, pwz = null, specialization = null, price = null, grade = null, address = null, notifications = true) {
        this.name = name;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.birthDate = birthDate;
        this.gender = gender;
        this.pwz = pwz;
        this.specialization = specialization;
        this.price = price;
        this.grade = grade;
        this.address = address;
        this.notifications = notifications;
    }
}

export default User;
