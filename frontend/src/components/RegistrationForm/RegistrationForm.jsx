import styles from './RegistrationForm.module.css';
import hacktoberlogo from './hacktober_logo.svg';
import swclogo from './swc_logo.png';
const RegistrationForm = (props) => {
    return (
        <div className={styles.landingPage}>
        <div className={styles.SwcLogo}>
            <img src={swclogo} alt=""/>
        </div>
        <div className={styles.FormSection}>
            <div className={styles.UserName}>
               Hello  xyz
            </div>
            <form action="" className='flex flex-col items-center w-full' >
                <div className={styles.Form}>
                    <div className={styles.FormInput}>
                        <div><label for="Roll">Name</label></div>
                        <div><input type="text" name="Name"/></div>
                    </div>
                    <div className={styles.FormInput}>
                        <div><label for="Roll">Roll Number</label></div>
                        <div><input type="number" name="Roll"/></div>
                    </div>

                    <div className={styles.FormInput}>
                        <div><label for="Outlook">Outlook</label></div>
                        <div><input type="email" name="Outlook"/></div>
                    </div>

                    <div className={styles.FormInput}>
                        <div><label for="Year">Year</label></div>
                        <div>  <select name="Year" >
                            <option value="0" selected hidden></option>
                            <option value="1">First</option>
                            <option value="2">Second</option>
                            <option value="3">Third</option>
                            <option value="4">Fourth</option>
                          </select></div>
                    </div>
                    <div className={styles.FormInput}>
                        <div><label for="Programme">Programme</label></div>
                        <div>  <select name="Programme">
                            <option value="none" selected hidden></option>
                            <option value="Btech">Btech</option>
                            <option value="Mtech">Mtech</option>
                          </select></div>
                    </div>
                 
                    <div className={styles.FormInput}>
                        <div><label for="Department">Department</label></div>
                        <div><input type="text" name="Department"/></div>
                    </div>
                    <div className={styles.FormInput}>
                        <div><label for="Hostel">Hostel</label></div>
                        <div>  <select name="Hostel">
                            <option value="none" selected hidden></option>
                            <option value="Lohit">Lohit</option>
                            <option value="Disang">Disang</option>
                          </select></div>
                    </div>

                </div>
                <div className='w-4/5'>
                    <button className={styles.FormSectionButton}>
                        Submit</button>
                </div>
            </form>

        </div>
        <div className={styles.HacktoberLogo}>
            <img src={hacktoberlogo} alt=""/>
        </div>
    </div>
    );
}

export default RegistrationForm;