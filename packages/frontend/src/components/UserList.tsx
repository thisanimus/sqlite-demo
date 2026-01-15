import { useEffect, useState } from 'react';
import { Db, mapDbResults, type User } from '../data/DatabaseService';

function UsersList() {
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		Db.query({ statement: 'SELECT * FROM Users', values: [] }).then((result) => {
			const paresedUsers = mapDbResults<User>(result);
			setUsers(paresedUsers || []);
		});
	}, []);

	return (
		<table>
			<thead>
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>Email</th>
				</tr>
			</thead>
			<tbody>
				{users.map((user) => (
					<tr key={user.id}>
						<td>{user.id}</td>
						<td>{user.name}</td>
						<td>{user.email}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
export default UsersList;
