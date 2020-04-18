<?php

use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder {

	public function run()
	{
		$admin = \App\Model\User::find(1);
        if ($admin && !$this->command->confirm('管理员已经存在，是否要更新？', true)) {
            return;
        }

        // 获取管理员关键信息
        $name = $this->command->ask('请输入管理员名字.', 'admin');
        $email = $this->command->ask('请输入管理员Email.', 'admin@example.com');
        $mobile = $this->command->ask('请输入管理员手机号.', '13888888888');
        $password = $this->command->ask('请输入管理员密码.', '123456');

        if (!$admin) {
            $admin = new \App\Model\User();
        }
        $admin->name = $name;
        $admin->email = $email;
        $admin->mobile = $mobile;
        $admin->password = bcrypt($password);
        $admin->save();

        $this->command->info('系统默认账户设置完毕。');
	}

}