import PageContainer from '../components/PageContainer'

export default function Error404() {
	return (
		<PageContainer title="Authentication">
			<p>
				<b>This website uses Google as its authentication provider.</b>
			</p>
			<p>
				Authentication is needed in order to identify the user and grant them access to such
				features as adding their own music, creating their private radio stations, saving their
				progress in games etc.
			</p>
			<p>
				Google was chosen because it is secure, reliable and the vast majority of users on the
				internet already have an account.
			</p>
			<p>
				The only piece of data that is collected by this website is your Google <b>Account ID</b> -
				a unique string of characters that is assigned to every Google account. Nothing more is
				needed for the purposes of this website yet, but, if you're curious, know that with the
				account ID it is possible to retrieve your general information: email address, profile
				picture, and name (as set in your profile)
			</p>
		</PageContainer>
	)
}
