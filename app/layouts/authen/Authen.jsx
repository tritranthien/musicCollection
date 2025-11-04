import { Outlet } from "react-router";
import styles from "./Authen.module.css";
import Logo from "../../components/logo/Logo";

export default function AuthenLayout() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Outlet/>
            </div>
        </div>
    )
}